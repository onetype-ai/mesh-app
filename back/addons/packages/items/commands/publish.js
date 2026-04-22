import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import packages from '#shared/packages/addon.js';

commands.Item({
	id: 'packages:publish',
	exposed: true,
	method: 'POST',
	endpoint: '/api/packages/:id/publish',
	in: {
		id: ['string', null, true]
	},
	out: 'package',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const item = await packages.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.one();

		if(!item)
		{
			return resolve(null, 'Package not found.', 404);
		}

		const result = await onetype.PipelineRun('packages:publish', { id: properties.id });

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		item.Set('status', 'Published');

		resolve(item.GetData());
	}
});
