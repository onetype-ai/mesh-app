import commands from '@onetype/framework/commands';
import services from '#shared/services/addon.js';

commands.Item({
	id: 'services:update',
	exposed: true,
	method: 'PUT',
	endpoint: '/api/services/:id',
	in: 'service --optional --pick=id --pick=name --pick=slug --pick=description --pick=overview --pick=version --pick=script_requirements_id --pick=script_deploy_id --pick=script_start_id --pick=script_stop_id --pick=script_restart_id --pick=script_destroy_id --pick=script_status_id --pick=config --pick=deployed_metric --pick=running_metric --pick=platforms --pick=is_marketplace',
	out: 'service',
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

		const item = await services.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.one();

		if(!item)
		{
			return resolve(null, 'Service not found.', 404);
		}

		const fields = ['name', 'slug', 'description', 'overview', 'version', 'script_requirements_id', 'script_deploy_id', 'script_start_id', 'script_stop_id', 'script_restart_id', 'script_destroy_id', 'script_status_id', 'config', 'deployed_metric', 'running_metric', 'platforms', 'is_marketplace'];

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
