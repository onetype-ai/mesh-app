import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:services:status',
	exposed: true,
	method: 'POST',
	endpoint: '/api/servers/services/status',
	in: {
		server_id: ['string', null, true],
		service_id: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const result = await onetype.PipelineRun('servers:services:status', {
			server_id: properties.server_id,
			service_id: properties.service_id,
			team_id: this.http.state.user.team.id
		}, { state: this.http.state });

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		resolve({});
	}
});
