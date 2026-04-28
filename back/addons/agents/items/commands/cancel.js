import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import servers from '#shared/servers/addon.js';

commands.Item({
	id: 'agents:cancel',
	exposed: true,
	method: 'POST',
	endpoint: '/api/agents/cancel',
	in: {
		server:     ['string', null, true],
		command_id: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const server = await servers.Find()
			.filter('id', properties.server)
			.filter('team_id', this.http.state.user.team.id)
			.filter('is_connected', true)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!server)
		{
			return resolve(null, 'Server not found or not connected.', 404);
		}

		const result = await onetype.PipelineRun('agents:cancel', {
			agent_id:   server.Get('id'),
			command_id: properties.command_id
		});

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		resolve({});
	}
});
