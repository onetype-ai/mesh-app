import commands from '@onetype/framework/commands';
import approvals from '#shared/approvals/addon.js';

commands.Item({
	id: 'approvals:create',
	in: 'approval --skip=id --skip=updated_at --skip=created_at --skip=deleted_at',
	out: 'approval',
	callback: async function(properties, resolve)
	{
		const item = approvals.Item(properties);

		await item.Create();

		resolve(item.GetData());
	}
});
