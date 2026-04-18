import commands from '@onetype/framework/commands';
import servers from '#shared/servers/addon.js';

commands.Item({
	id: 'servers:remove',
	exposed: true,
	method: 'POST',
	endpoint: '/api/servers/remove',
	in: {
		server: ['string', null, true],
		cleanup: ['boolean', false]
	},
	out: {
		removed: ['boolean', false, true]
	},
	callback: async function(properties, resolve)
	{
		const item = await servers.Find().filter('id', properties.server).one();

		if(!item)
		{
			return resolve(null, 'Server not found.', 404);
		}

		await servers.Fn('remove', item, properties.cleanup);

		resolve({ removed: true });
	}
});
