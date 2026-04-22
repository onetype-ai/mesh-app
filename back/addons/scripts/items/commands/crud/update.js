import commands from '@onetype/framework/commands';
import scripts from '#shared/scripts/addon.js';

commands.Item({
	id: 'scripts:update',
	exposed: true,
	method: 'PUT',
	endpoint: '/api/scripts/:id',
	in: 'script --optional --pick=id --pick=name --pick=slug --pick=description --pick=platforms --pick=autorun --pick=loop --pick=output --pick=bash --pick=config --pick=metrics',
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

		const fields = ['name', 'slug', 'description', 'platforms', 'autorun', 'loop', 'output', 'bash', 'config', 'metrics'];

		for(const field of fields)
		{
			if(properties[field] !== undefined)
			{
				item.Set(field, properties[field]);
			}
		}

		item.Set('is_verified', false);

		await item.Update({ whitelist: [...fields, 'is_verified'] });

		resolve(item.GetData());
	}
});
