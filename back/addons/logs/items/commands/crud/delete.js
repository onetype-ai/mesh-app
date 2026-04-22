import commands from '@onetype/framework/commands';
import logs from '#shared/logs/addon.js';

commands.Item({
	id: 'logs:delete',
	in: {
		id: ['string', null, true]
	},
	out: 'log',
	callback: async function(properties, resolve)
	{
		const item = await logs.Find().filter('id', properties.id).one();

		if(!item)
		{
			return resolve(null, 'Log not found.', 404);
		}

		item.Set('deleted_at', new Date().toISOString());
		await item.Update();

		resolve(item.GetData());
	}
});
