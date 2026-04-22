import onetype from '@onetype/framework';
import servers from '#shared/servers/addon.js';
import packages from '#shared/packages/addon.js';
import scripts from '#shared/scripts/addon.js';

onetype.Pipeline('servers:packages:install', {
	description: 'Install a package on a server — runs the install script then creates a row in servers_packages.',
	in: {
		server_id: ['string', null, true],
		package_id: ['string', null, true],
		team_id: ['string', null, true]
	},
	out: {
		link: ['object', null, true]
	}
})

.Join('load.server', 10, {
	description: 'Resolve the server and verify ownership.',
	out: {
		server: ['object']
	},
	callback: async ({ server_id, team_id }, resolve) =>
	{
		const server = await servers.Find()
			.filter('id', server_id)
			.filter('team_id', team_id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!server)
		{
			return resolve(null, 'Server not found.', 404);
		}

		return { server };
	}
})

.Join('load.package', 20, {
	description: 'Resolve the source package from the team library.',
	out: {
		package: ['object']
	},
	callback: async ({ package_id, team_id }, resolve) =>
	{
		const pkg = await packages.Find()
			.filter('id', package_id)
			.filter('team_id', team_id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!pkg)
		{
			return resolve(null, 'Package not found.', 404);
		}

		return { package: pkg };
	}
})

.Join('guard', 30, {
	description: 'Prevent installing the same package twice.',
	requires: ['server', 'package'],
	callback: async ({ server, package: pkg, team_id }, resolve) =>
	{
		const existing = await servers.packages.Find()
			.filter('server_id', server.Get('id'))
			.filter('package_id', pkg.Get('id'))
			.filter('team_id', team_id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(existing)
		{
			return resolve(null, 'Package ' + pkg.Get('name') + ' is already installed on this server.', 409);
		}
	}
})

.Join('install', 40, {
	description: 'Run the install script on the server.',
	requires: ['server', 'package'],
	when: ({ package: pkg }) => !!pkg.Get('script_install_id'),
	callback: async function({ server, package: pkg }, resolve)
	{
		const install = await scripts.Find()
			.filter('id', pkg.Get('script_install_id'))
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!install)
		{
			return resolve(null, 'Install script missing.', 500);
		}

		const result = await this.Pipeline('agents:bash', {
			agent_id: server.Get('id'),
			bash: install.Get('bash')
		});

		if(result.code !== 0)
		{
			return resolve(null, 'Install script exited with code ' + result.code + '.', 500);
		}
	}
})

.Join('create', 50, {
	description: 'Create the servers_packages join row.',
	requires: ['server', 'package'],
	out: {
		link: ['object']
	},
	callback: async function({ server, package: pkg, team_id })
	{
		const link = servers.packages.Item({
			team_id,
			server_id: server.Get('id'),
			package_id: pkg.Get('id'),
			config: {}
		});

		await link.Create({ connection: this.wrap.transaction });

		return { link };
	},
	rollback: async function({ server, package: pkg })
	{
		if(!pkg.Get('script_uninstall_id'))
		{
			return;
		}

		const uninstall = await scripts.Find()
			.filter('id', pkg.Get('script_uninstall_id'))
			.filter('deleted_at', null, 'NULL')
			.one();

		if(uninstall)
		{
			await this.Pipeline('agents:bash', {
				agent_id: server.Get('id'),
				bash: uninstall.Get('bash')
			});
		}
	}
});
