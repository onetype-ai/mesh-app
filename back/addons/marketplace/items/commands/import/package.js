import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
	id: 'marketplace:package:import',
	exposed: true,
	method: 'POST',
	endpoint: '/api/marketplace/packages/import',
	in: {
		package_id: ['string', null, true]
	},
	out: 'package',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const result = await onetype.PipelineRun('marketplace:import:package', {
			package_id: properties.package_id,
			team_id: this.http.state.user.team.id
		});

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		resolve(result.data.package.GetData());
	}
});
