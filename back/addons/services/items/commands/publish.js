import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import services from '#shared/services/addon.js';

commands.Item({
	id: 'services:publish',
	exposed: true,
	method: 'POST',
	endpoint: '/api/services/:id/publish',
	in: {
		id: ['string', null, true]
	},
	out: 'service',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const item = await services.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.one();

		if(!item)
		{
			return resolve(null, 'Service not found.', 404);
		}

		const result = await onetype.PipelineRun('services:publish', { id: properties.id });

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		item.Set('status', 'Published');

		resolve(item.GetData());
	}
});
