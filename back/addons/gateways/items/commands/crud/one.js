import commands from '@onetype/framework/commands';
import gateways from '#shared/gateways/addon.js';

commands.Item({
	id: 'gateways:one',
	exposed: true,
	method: 'GET',
	endpoint: '/api/gateways/:id',
	in: {
		id: ['string', null, true]
	},
	out: 'gateway',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const item = await gateways.Find().filter('id', properties.id).one();

		if(!item)
		{
			return resolve(null, 'Gateway not found.', 404);
		}

		resolve(item.GetData());
	}
});
