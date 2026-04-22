import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:scripts:detach',
	exposed: true,
	method: 'POST',
	endpoint: '/api/servers/scripts/detach',
	in: {
		server_id: ['string', null, true],
		script_id: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const result = await onetype.PipelineRun('servers:scripts:detach', {
			server_id: properties.server_id,
			script_id: properties.script_id,
			team_id: this.http.state.user.team.id
		}, { state: this.http.state });

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		resolve({});
	}
});
