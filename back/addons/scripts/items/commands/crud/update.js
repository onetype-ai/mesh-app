import commands from '@onetype/framework/commands';
import scripts from '#shared/scripts/addon.js';

commands.Item({
	id: 'scripts:update',
	exposed: true,
	method: 'PUT',
	endpoint: '/api/scripts/:id',
	in: 'script --optional --skip=team_id --skip=hash --skip=status --skip=is_verified --skip=updated_at --skip=created_at --skip=deleted_at',
	out: 'script',
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

		const item = await scripts.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.one();

		if(!item)
		{
			return resolve(null, 'Script not found.', 404);
		}

		for(const [key, value] of Object.entries(properties))
		{
			if(key === 'id')
			{
				continue;
			}

			item.Set(key, value);
		}

		item.Set('is_verified', false);

		await item.Update();

		resolve(item.GetData());
	}
});
