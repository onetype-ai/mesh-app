import onetype from '@onetype/framework';
import packages from '#shared/packages/addon.js';
import scripts from '#shared/scripts/addon.js';

onetype.Pipeline('packages:publish', {
	description: 'Publish a package after validating required scripts and configuration.',
	in: {
		id: ['string', null, true]
	}
})
.Join('load', 10, {
	description: 'Load package.',
	out: {
		item: ['object', null, true],
		previous: ['string', null, true]
	},
	callback: async ({ id }, resolve) =>
	{
		const item = await packages.Find().filter('id', id).one();

		if(!item)
		{
			return resolve(null, 'Package not found.', 404);
		}

		return { item, previous: item.Get('status') };
	}
})
.Join('validate.fields', 20, {
	description: 'Validate required fields.',
	requires: ['item'],
	callback: async ({ item }, resolve) =>
	{
		const name = item.Get('name');
		const platforms = item.Get('platforms');
		const install = item.Get('script_install_id');
		const uninstall = item.Get('script_uninstall_id');
		const status_id = item.Get('script_status_id');
		const metric = item.Get('installed_metric');

		if(!name || !name.trim())
		{
			return resolve(null, 'Package must have a name.', 400);
		}

		if(!platforms || !platforms.length)
		{
			return resolve(null, 'Package must target at least one platform.', 400);
		}

		if(!install || !uninstall)
		{
			return resolve(null, 'Package must have both install and uninstall scripts.', 400);
		}

		if(metric && !status_id)
		{
			return resolve(null, 'Installed metric requires a status script.', 400);
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
			item.Get('script_install_id'),
			item.Get('script_uninstall_id'),
			item.Get('script_status_id')
		].filter(Boolean);

		const list = await scripts.Find()
			.filter('id', ids, 'IN')
			.filter('team_id', item.Get('team_id'))
			.filter('status', 'Published')
			.many();

		const found = new Set(list.map((script) => script.Get('id')));

		for(const id of ids)
		{
			if(!found.has(id))
			{
				return resolve(null, 'Referenced script :id: is missing or not published.'.replace(':id:', id), 400);
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
