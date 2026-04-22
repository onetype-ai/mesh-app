import onetype from '@onetype/framework';
import servers from '#shared/servers/addon.js';
import services from '#shared/services/addon.js';
import scripts from '#shared/scripts/addon.js';

onetype.Pipeline('servers:services:destroy', {
	description: 'Destroy a service on a server — runs the destroy script then soft-deletes the servers_services row. Blocks if bash fails.',
	timeout: 1800000,
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

.Join('destroy', 40, {
	description: 'Run the destroy script on the server. Must succeed before removing the link.',
	requires: ['server', 'service'],
	when: ({ service }) => !!service.Get('script_destroy_id'),
	callback: async function({ server, service }, resolve)
	{
		const destroy = await scripts.Find()
			.filter('id', service.Get('script_destroy_id'))
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!destroy)
		{
			return resolve(null, 'Destroy script missing.', 500);
		}

		const result = await this.Pipeline('agents:bash', {
			agent_id: server.Get('id'),
			bash: destroy.Get('bash'), timeout: 1800000
		});

		if(result.code !== 0)
		{
			return resolve(null, 'Destroy script exited with code ' + result.code + '.', 500);
		}
	}
})

.Join('remove', 50, {
	description: 'Soft-delete the servers_services row.',
	requires: ['link'],
	callback: async ({ link }) =>
	{
		link.Set('deleted_at', new Date().toISOString());
		await link.Update();
	}
});
