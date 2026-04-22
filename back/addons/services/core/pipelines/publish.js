import onetype from '@onetype/framework';
import services from '#shared/services/addon.js';
import scripts from '#shared/scripts/addon.js';

onetype.Pipeline('services:publish', {
	description: 'Publish a service after validating required scripts and configuration.',
	in: {
		id: ['string', null, true]
	}
})
.Join('load', 10, {
	description: 'Load service.',
	out: {
		item: ['object', null, true],
		previous: ['string', null, true]
	},
	callback: async ({ id }, resolve) =>
	{
		const item = await services.Find().filter('id', id).one();

		if(!item)
		{
			return resolve(null, 'Service not found.', 404);
		}

		return { item, previous: item.Get('status') };
	}
})
.Join('validate.fields', 20, {
	description: 'Validate required fields and script pair consistency.',
	requires: ['item'],
	callback: async ({ item }, resolve) =>
	{
		const name = item.Get('name');
		const platforms = item.Get('platforms');
		const deploy = item.Get('script_deploy_id');
		const destroy = item.Get('script_destroy_id');
		const start = item.Get('script_start_id');
		const stop = item.Get('script_stop_id');
		const restart = item.Get('script_restart_id');
		const status_id = item.Get('script_status_id');
		const deployedMetric = item.Get('deployed_metric');
		const runningMetric = item.Get('running_metric');

		if(!name || !name.trim())
		{
			return resolve(null, 'Service must have a name.', 400);
		}

		if(!platforms || !platforms.length)
		{
			return resolve(null, 'Service must target at least one platform.', 400);
		}

		if(!deploy || !destroy)
		{
			return resolve(null, 'Service must have both deploy and destroy scripts.', 400);
		}

		if((start && !stop) || (stop && !start))
		{
			return resolve(null, 'Start and stop scripts must be defined together.', 400);
		}

		if(restart && (!start || !stop))
		{
			return resolve(null, 'Restart script requires both start and stop scripts.', 400);
		}

		if(deployedMetric && !status_id)
		{
			return resolve(null, 'Deployed metric requires a status script.', 400);
		}

		if(runningMetric && !status_id)
		{
			return resolve(null, 'Running metric requires a status script.', 400);
		}

		if(runningMetric && (!start || !stop))
		{
			return resolve(null, 'Running metric requires start and stop scripts.', 400);
		}
	}
})
.Join('validate.scripts', 30, {
	description: 'Validate referenced scripts exist, belong to the team and are published.',
	requires: ['item'],
	callback: async ({ item }, resolve) =>
	{
		const ids = [
			item.Get('script_requirements_id'),
			item.Get('script_deploy_id'),
			item.Get('script_destroy_id'),
			item.Get('script_start_id'),
			item.Get('script_stop_id'),
			item.Get('script_restart_id'),
			item.Get('script_status_id')
		].filter(Boolean);

		const all = await scripts.Find()
			.filter('id', ids, 'IN')
			.filter('team_id', item.Get('team_id'))
			.filter('deleted_at', null, 'NULL')
			.many();

		const byId = new Map(all.map((script) => [String(script.Get('id')), script]));

		for(const id of ids)
		{
			const script = byId.get(String(id));

			if(!script)
			{
				return resolve(null, 'Referenced script ' + id + ' not found.', 400);
			}

			if(script.Get('status') !== 'Published')
			{
				return resolve(null, 'Script "' + script.Get('name') + '" is still Draft — publish it first.', 400);
			}
		}
	}
})
.Join('publish', 40, {
	description: 'Set status to Published.',
	requires: ['item'],
	callback: async ({ item }, resolve) =>
	{
		item.Set('status', 'Published');
		await item.Update();
	},
	rollback: async ({ item, previous }) =>
	{
		if(item && previous)
		{
			item.Set('status', previous);
			await item.Update();
		}
	}
});
