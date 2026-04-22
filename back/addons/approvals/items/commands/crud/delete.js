import commands from '@onetype/framework/commands';
import approvals from '#shared/approvals/addon.js';

commands.Item({
	id: 'approvals:delete',
	in: {
		id: ['string', null, true]
	},
	out: 'approval',
	callback: async function(properties, resolve)
	{
		const item = await approvals.Find().filter('id', properties.id).one();

		if(!item)
		{
			return resolve(null, 'Approval not found.', 404);
		}

		item.Set('deleted_at', new Date().toISOString());
		await item.Update();

		resolve(item.GetData());
	}
});
