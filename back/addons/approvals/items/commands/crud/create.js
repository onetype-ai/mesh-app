import commands from '@onetype/framework/commands';
import approvals from '#shared/approvals/addon.js';

commands.Item({
	id: 'approvals:create',
	in: 'approval --skip=id --skip=updated_at --skip=created_at --skip=deleted_at',
	out: 'approval',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const item = approvals.Item({
			...properties,
			team_id: this.http.state.user.team.id
		});

		await item.Create();

		resolve(item.GetData());
	}
});
