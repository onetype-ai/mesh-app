import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import servers from '#shared/servers/addon.js';

commands.Item({
	id: 'servers:ping',
	exposed: true,
	method: 'POST',
	endpoint: '/api/servers/:id/ping',
	in: {
		id: ['string', null, true]
	},
	out: {
		connected: ['boolean', false, true]
	},
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const server = await servers.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!server)
		{
			return resolve(null, 'Server not found.', 404);
		}

		const result = await onetype.PipelineRun('agents:metrics.static', { agent_id: server.Get('id') });

		console.log('[servers:ping] code=', result.code, 'message=', result.message);

		resolve({ connected: result.code === 200 });
	}
});
