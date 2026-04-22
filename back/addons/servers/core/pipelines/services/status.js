import onetype from '@onetype/framework';
import servers from '#shared/servers/addon.js';
import services from '#shared/services/addon.js';
import scripts from '#shared/scripts/addon.js';

onetype.Pipeline('servers:services:status', {
	description: 'Run the status script for a deployed service — refreshes metrics.',
	in: {
		server_id: ['string', null, true],
		service_id: ['string', null, true],
		team_id: ['string', null, true]
	}
})

.Join('load.link', 10, {
	description: 'Resolve the active servers_services row.',
	out: {
		link: ['object']
	},
	callback: async ({ server_id, service_id, team_id }, resolve) =>
	{
		const link = await servers.services.Find()
			.filter('server_id', server_id)
			.filter('service_id', service_id)
			.filter('team_id', team_id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!link)
		{
			return resolve(null, 'Service is not deployed on this server.', 404);
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

.Join('load.service', 30, {
	description: 'Resolve the source service.',
	requires: ['link'],
	out: {
		service: ['object']
	},
	callback: async ({ link }, resolve) =>
	{
		const service = await services.Find()
			.filter('id', link.Get('service_id'))
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!service)
		{
			return resolve(null, 'Service not found.', 404);
		}

		return { service };
	}
})

.Join('status', 40, {
	description: 'Run the status script on the server.',
	requires: ['server', 'service'],
	callback: async function({ server, service }, resolve)
	{
		if(!service.Get('script_status_id'))
		{
			return resolve(null, 'Service does not declare a status script.', 400);
		}

		const status = await scripts.Find()
			.filter('id', service.Get('script_status_id'))
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!status)
		{
			return resolve(null, 'Status script missing.', 500);
		}

		const result = await this.Pipeline('agents:bash', {
			agent_id: server.Get('id'),
			bash: status.Get('bash'), timeout: 1800000
		});

		if(result.code !== 0)
		{
			return resolve(null, 'Status script exited with code ' + result.code + '.', 500);
		}
	}
});
