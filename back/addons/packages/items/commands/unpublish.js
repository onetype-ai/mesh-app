import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import packages from '#shared/packages/addon.js';

commands.Item({
	id: 'packages:unpublish',
	exposed: true,
	method: 'POST',
	endpoint: '/api/packages/:id/unpublish',
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

		const result = await onetype.PipelineRun('packages:unpublish', { id: properties.id }, { state: this.http.state });

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		const fresh = await packages.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.one();

		resolve(fresh ? fresh.GetData() : item.GetData());
	}
});
