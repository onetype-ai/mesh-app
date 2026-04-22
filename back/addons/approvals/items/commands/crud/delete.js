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
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const item = await approvals.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!item)
		{
			return resolve(null, 'Approval not found.', 404);
		}

		item.Set('deleted_at', new Date().toISOString());
		await item.Update();

		resolve(item.GetData());
	}
});
