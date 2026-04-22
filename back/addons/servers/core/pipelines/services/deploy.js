import onetype from '@onetype/framework';
import servers from '#shared/servers/addon.js';
import services from '#shared/services/addon.js';
import scripts from '#shared/scripts/addon.js';

onetype.Pipeline('servers:services:deploy', {
	description: 'Deploy a service on a server — runs the deploy script then creates a row in servers_services.',
	in: {
		server_id: ['string', null, true],
		service_id: ['string', null, true],
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

.Join('load.service', 20, {
	description: 'Resolve the source service from the team library.',
	out: {
		service: ['object']
	},
	callback: async ({ service_id, team_id }, resolve) =>
	{
		const service = await services.Find()
			.filter('id', service_id)
			.filter('team_id', team_id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!service)
		{
			return resolve(null, 'Service not found.', 404);
		}

		return { service };
	}
})

.Join('guard', 30, {
	description: 'Prevent deploying the same service twice.',
	requires: ['server', 'service'],
	callback: async ({ server, service, team_id }, resolve) =>
	{
		const existing = await servers.services.Find()
			.filter('server_id', server.Get('id'))
			.filter('service_id', service.Get('id'))
			.filter('team_id', team_id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(existing)
		{
			return resolve(null, 'Service ' + service.Get('name') + ' is already deployed on this server.', 409);
		}
	}
})

.Join('deploy', 40, {
	description: 'Run the deploy script on the server.',
	requires: ['server', 'service'],
	when: ({ service }) => !!service.Get('script_deploy_id'),
	callback: async function({ server, service }, resolve)
	{
		const deploy = await scripts.Find()
			.filter('id', service.Get('script_deploy_id'))
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!deploy)
		{
			return resolve(null, 'Deploy script missing.', 500);
		}

		const result = await this.Pipeline('agents:bash', {
			agent_id: server.Get('id'),
			bash: deploy.Get('bash')
		});

		if(result.code !== 0)
		{
			return resolve(null, 'Deploy script exited with code ' + result.code + '.', 500);
		}
	}
})

.Join('create', 50, {
	description: 'Create the servers_services join row.',
	requires: ['server', 'service'],
	out: {
		link: ['object']
	},
	callback: async function({ server, service, team_id })
	{
		const link = servers.services.Item({
			team_id,
			server_id: server.Get('id'),
			service_id: service.Get('id'),
			config: {}
		});

		await link.Create({ connection: this.wrap.transaction });

		return { link };
	},
	rollback: async function({ server, service })
	{
		if(!service.Get('script_destroy_id'))
		{
			return;
		}

		const destroy = await scripts.Find()
			.filter('id', service.Get('script_destroy_id'))
			.filter('deleted_at', null, 'NULL')
			.one();

		if(destroy)
		{
			await this.Pipeline('agents:bash', {
				agent_id: server.Get('id'),
				bash: destroy.Get('bash')
			});
		}
	}
});
