import commands from '@onetype/framework/commands';
import approvals from '#shared/approvals/addon.js';

commands.Item({
	id: 'approvals:update',
	in: 'approval --optional --skip=updated_at --skip=created_at --skip=deleted_at',
	out: 'approval',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		if(!properties.id)
		{
			return resolve(null, 'Id required.', 400);
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

		const whitelist = ['is_approved'];

		for(const key of whitelist)
		{
			if(properties[key] !== undefined)
			{
				item.Set(key, properties[key]);
			}
		}

		await item.Update();

		resolve(item.GetData());
	}
});
