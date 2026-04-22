import commands from '@onetype/framework/commands';
import packages from '#shared/packages/addon.js';

commands.Item({
	id: 'packages:one',
	exposed: true,
	method: 'GET',
	endpoint: '/api/packages/:id',
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

		resolve(item.GetData());
	}
});
