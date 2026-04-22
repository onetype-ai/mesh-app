import onetype from '@onetype/framework';
import packages from '#shared/packages/addon.js';

onetype.Pipeline('packages:unpublish', {
	description: 'Move a package back to Draft. No cascade — packages are leaf nodes and nothing references them.',
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
		const item = await packages.Find().filter('id', id).filter('deleted_at', null, 'NULL').one();

		if(!item)
		{
			return resolve(null, 'Package not found.', 404);
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
});
