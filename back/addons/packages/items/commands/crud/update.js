import commands from '@onetype/framework/commands';
import packages from '#shared/packages/addon.js';

commands.Item({
	id: 'packages:update',
	exposed: true,
	method: 'PUT',
	endpoint: '/api/packages/:id',
	in: 'package --optional --skip=team_id --skip=status --skip=is_verified --skip=updated_at --skip=created_at --skip=deleted_at',
	out: 'package',
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

		const item = await packages.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.one();

		if(!item)
		{
			return resolve(null, 'Package not found.', 404);
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
