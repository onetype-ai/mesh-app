import commands from '@onetype/framework/commands';
import logs from '#shared/logs/addon.js';

commands.Item({
	id: 'logs:create',
	in: 'log --skip=id --skip=updated_at --skip=created_at --skip=deleted_at',
	out: 'log',
	callback: async function(properties, resolve)
	{
		const item = logs.Item(properties);

		await item.Create();

		resolve(item.GetData());
	}
});
