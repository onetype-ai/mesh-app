import commands from '@onetype/framework/commands';
import logs from '#shared/logs/addon.js';

commands.Item({
	id: 'logs:update',
	in: 'log --optional --skip=updated_at --skip=created_at --skip=deleted_at',
	out: 'log',
	callback: async function(properties, resolve)
	{
		if(!properties.id)
		{
			return resolve(null, 'Id required.', 400);
		}

		const item = await logs.Find().filter('id', properties.id).one();

		if(!item)
		{
			return resolve(null, 'Log not found.', 404);
		}

		for(const [key, value] of Object.entries(properties))
		{
			if(key === 'id')
			{
				continue;
			}

			item.Set(key, value);
		}

		await item.Update();

		resolve(item.GetData());
	}
});
