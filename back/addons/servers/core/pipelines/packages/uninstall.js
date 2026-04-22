import onetype from '@onetype/framework';
import servers from '#shared/servers/addon.js';
import packages from '#shared/packages/addon.js';
import scripts from '#shared/scripts/addon.js';

onetype.Pipeline('servers:packages:uninstall', {
	description: 'Uninstall a package from a server — runs the uninstall script then soft-deletes the servers_packages row.',
	in: {
		server_id: ['string', null, true],
		package_id: ['string', null, true],
		team_id: ['string', null, true]
	}
})

.Join('load.link', 10, {
	description: 'Resolve the active servers_packages row.',
	out: {
		link: ['object']
	},
	callback: async ({ server_id, package_id, team_id }, resolve) =>
	{
		const link = await servers.packages.Find()
			.filter('server_id', server_id)
			.filter('package_id', package_id)
			.filter('team_id', team_id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!link)
		{
			return resolve(null, 'Package is not installed on this server.', 404);
		}

		return { link };
	}
})

.Join('load.server', 20, {
	description: 'Resolve the server.',
	requires: ['link'],
	out: {
		server: ['object']
	},
	callback: async ({ link }, resolve) =>
	{
		const server = await servers.Find()
			.filter('id', link.Get('server_id'))
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!server)
		{
			return resolve(null, 'Server not found.', 404);
		}

		return { server };
	}
})

.Join('load.package', 30, {
	description: 'Resolve the source package.',
	requires: ['link'],
	out: {
		package: ['object']
	},
	callback: async ({ link }, resolve) =>
	{
		const pkg = await packages.Find()
			.filter('id', link.Get('package_id'))
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!pkg)
		{
			return resolve(null, 'Package not found.', 404);
		}

		return { package: pkg };
	}
})

.Join('uninstall', 40, {
	description: 'Run the uninstall script on the server.',
	requires: ['server', 'package'],
	when: ({ package: pkg }) => !!pkg.Get('script_uninstall_id'),
	callback: async function({ server, package: pkg }, resolve)
	{
		const uninstall = await scripts.Find()
			.filter('id', pkg.Get('script_uninstall_id'))
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!uninstall)
		{
			return resolve(null, 'Uninstall script missing.', 500);
		}

		const result = await this.Pipeline('agents:bash', {
			agent_id: server.Get('id'),
			bash: uninstall.Get('bash')
		});

		if(result.code !== 0)
		{
			return resolve(null, 'Uninstall script exited with code ' + result.code + '.', 500);
		}
	}
})

.Join('remove', 50, {
	description: 'Soft-delete the servers_packages row.',
	requires: ['link'],
	callback: async ({ link }) =>
	{
		link.Set('deleted_at', new Date().toISOString());
		await link.Update();
	}
});
