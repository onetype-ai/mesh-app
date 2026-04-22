import onetype from '@onetype/framework';
import servers from '#shared/servers/addon.js';
import scripts from '#shared/scripts/addon.js';

onetype.Pipeline('servers:scripts:attach', {
	description: 'Attach a script to a server — creates a row in servers_scripts if not already attached.',
	in: {
		server_id: ['string', null, true],
		script_id: ['string', null, true],
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

.Join('load.script', 20, {
	description: 'Resolve the source script from the team library.',
	out: {
		script: ['object']
	},
	callback: async ({ script_id, team_id }, resolve) =>
	{
		const script = await scripts.Find()
			.filter('id', script_id)
			.filter('team_id', team_id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!script)
		{
			return resolve(null, 'Script not found.', 404);
		}

		return { script };
	}
})

.Join('guard', 30, {
	description: 'Prevent attaching the same script twice.',
	requires: ['server', 'script'],
	callback: async ({ server, script, team_id }, resolve) =>
	{
		const existing = await servers.scripts.Find()
			.filter('server_id', server.Get('id'))
			.filter('script_id', script.Get('id'))
			.filter('team_id', team_id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(existing)
		{
			return resolve(null, 'Script ' + script.Get('name') + ' is already attached to this server.', 409);
		}
	}
})

.Join('create', 40, {
	description: 'Create the servers_scripts join row.',
	requires: ['server', 'script'],
	out: {
		link: ['object']
	},
	callback: async function({ server, script, team_id })
	{
		const link = servers.scripts.Item({
			team_id,
			server_id: server.Get('id'),
			script_id: script.Get('id'),
			config: {}
		});

		await link.Create({ connection: this.wrap.transaction });

		return { link };
	}
});
