import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
	id: 'marketplace:script:import',
	exposed: true,
	method: 'POST',
	endpoint: '/api/marketplace/scripts/import',
	in: {
		script_id: ['string', null, true]
	},
	out: 'script',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const result = await onetype.PipelineRun('marketplace:import:script', {
			script_id: properties.script_id,
			team_id: this.http.state.user.team.id
		}, { state: this.http.state });

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		resolve(result.data.script.GetData());
	}
});
