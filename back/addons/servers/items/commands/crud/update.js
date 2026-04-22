import commands from '@onetype/framework/commands';
import servers from '#shared/servers/addon.js';

commands.Item({
	id: 'servers:update',
	exposed: true,
	method: 'PUT',
	endpoint: '/api/servers/:id',
	in: 'server --optional --pick=id --pick=name --pick=system_refresh',
	out: 'server',
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

		const item = await servers.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.one();

		if(!item)
		{
			return resolve(null, 'Server not found.', 404);
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
