import onetype from '@onetype/framework';
import packages from '#shared/packages/addon.js';

onetype.Pipeline('marketplace:import:package', {
	description: 'Import a marketplace package into a team library — duplicates the package and its scripts under the target team.',
	in: {
		package_id: ['string', null, true],
		team_id: ['string', null, true]
	},
	out: {
		package: ['object', null, true]
	}
})

.Join('load.source', 10, {
	description: 'Resolve the source package — must be marketplace, verified and Published.',
	out: {
		source: ['object']
	},
	callback: async ({ package_id }, resolve) =>
	{
		const source = await packages.Find()
			.filter('id', package_id)
			.filter('is_marketplace', true)
			.filter('is_verified', true)
			.filter('status', 'Published')
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!source)
		{
			return resolve(null, 'Package not found in marketplace.', 404);
		}

		return { source };
	}
})

.Join('duplicate', 20, {
	description: 'Duplicate the package under the target team.',
	requires: ['source'],
	out: {
		package: ['object']
	},
	callback: async function({ source, team_id })
	{
		const { package: pkg } = await this.Pipeline('packages:duplicate', {
			id: source.Get('id'),
			team_id
		});

		return { package: pkg };
	}
});
