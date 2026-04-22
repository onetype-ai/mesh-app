import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:scripts:attach',
	exposed: true,
	method: 'POST',
	endpoint: '/api/servers/scripts/attach',
	in: {
		server_id: ['string', null, true],
		script_id: ['string', null, true]
	},
	out: 'servers.script',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const result = await onetype.PipelineRun('servers:scripts:attach', {
			server_id: properties.server_id,
			script_id: properties.script_id,
			team_id: this.http.state.user.team.id
		});

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		resolve(result.data.link.GetData());
	}
});
