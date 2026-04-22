import onetype from '@onetype/framework';
import scripts from '#shared/scripts/addon.js';
import packages from '#shared/packages/addon.js';
import services from '#shared/services/addon.js';

onetype.Pipeline('scripts:unpublish', {
	description: 'Move a script back to Draft and cascade the same to every Published package or service that references it.',
	in: {
		id: ['string', null, true]
	}
})

.Join('load', 10, {
	description: 'Load script and verify ownership.',
	out: {
		item: ['object', null, true],
		previous: ['string', null, true]
	},
	callback: async ({ id }, resolve) =>
	{
		const item = await scripts.Find().filter('id', id).filter('deleted_at', null, 'NULL').one();

		if(!item)
		{
			return resolve(null, 'Script not found.', 404);
		}

		return { item, previous: item.Get('status') };
	}
})

.Join('mark.draft', 20, {
	description: 'Flip status to Draft. No-op if already Draft.',
	requires: ['item'],
	when: ({ item }) => item.Get('status') !== 'Draft',
	callback: async ({ item }) =>
	{
		item.Set('status', 'Draft');
		await item.Update({ whitelist: ['status'] });
	},
	rollback: async ({ item, previous }) =>
	{
		if(item && previous)
		{
			item.Set('status', previous);
			await item.Update({ whitelist: ['status'] });
		}
	}
})

.Join('cascade.packages', 30, {
	description: 'Unpublish every Published package that references this script in any script_*_id field.',
	requires: ['item'],
	callback: async function({ item })
	{
		const scriptId = item.Get('id');

		const list = await packages.Find()
			.filter('status', 'Published')
			.filter('deleted_at', null, 'NULL')
			.group('OR')
				.filter('script_requirements_id', scriptId)
				.filter('script_install_id', scriptId)
				.filter('script_uninstall_id', scriptId)
				.filter('script_status_id', scriptId)
			.end()
			.limit(1000)
			.many();

		for(const pkg of list)
		{
			await this.Pipeline('packages:unpublish', { id: pkg.Get('id') });
		}
	}
})

.Join('cascade.services', 40, {
	description: 'Unpublish every Published service that references this script in any script_*_id field.',
	requires: ['item'],
	callback: async function({ item })
	{
		const scriptId = item.Get('id');

		const list = await services.Find()
			.filter('status', 'Published')
			.filter('deleted_at', null, 'NULL')
			.group('OR')
				.filter('script_requirements_id', scriptId)
				.filter('script_deploy_id', scriptId)
				.filter('script_destroy_id', scriptId)
				.filter('script_start_id', scriptId)
				.filter('script_stop_id', scriptId)
				.filter('script_restart_id', scriptId)
				.filter('script_status_id', scriptId)
			.end()
			.limit(1000)
			.many();

		for(const service of list)
		{
			await this.Pipeline('services:unpublish', { id: service.Get('id') });
		}
	}
});
