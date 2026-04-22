import commands from '@onetype/framework/commands';
import approvals from '#shared/approvals/addon.js';

commands.Item({
	id: 'approvals:update',
	in: 'approval --optional --skip=updated_at --skip=created_at --skip=deleted_at',
	out: 'approval',
	callback: async function(properties, resolve)
	{
		if(!properties.id)
		{
			return resolve(null, 'Id required.', 400);
		}

		const item = await approvals.Find().filter('id', properties.id).one();

		if(!item)
		{
			return resolve(null, 'Approval not found.', 404);
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
