import commands from '@onetype/framework/commands';
import packages from '#shared/packages/addon.js';

commands.Item({
	id: 'packages:update',
	exposed: true,
	method: 'PUT',
	endpoint: '/api/packages/:id',
	in: 'package --optional --pick=id --pick=name --pick=slug --pick=description --pick=overview --pick=version --pick=script_requirements_id --pick=script_install_id --pick=script_uninstall_id --pick=script_status_id --pick=config --pick=installed_metric --pick=platforms',
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

		const fields = ['name', 'slug', 'description', 'overview', 'version', 'script_requirements_id', 'script_install_id', 'script_uninstall_id', 'script_status_id', 'config', 'installed_metric', 'platforms'];

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
