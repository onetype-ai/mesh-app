import onetype from '@onetype/framework';
import services from '#shared/services/addon.js';

onetype.Pipeline('marketplace:import:service', {
	description: 'Import a marketplace service into a team library — duplicates the service and its scripts under the target team.',
	in: {
		service_id: ['string', null, true],
		team_id: ['string', null, true]
	},
	out: {
		service: ['object', null, true]
	}
})

.Join('load.source', 10, {
	description: 'Resolve the source service — must be marketplace, verified and Published.',
	out: {
		source: ['object']
	},
	callback: async ({ service_id }, resolve) =>
	{
		const source = await services.Find()
			.filter('id', service_id)
			.filter('is_marketplace', true)
			.filter('is_verified', true)
			.filter('status', 'Published')
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!source)
		{
			return resolve(null, 'Service not found in marketplace.', 404);
		}

		return { source };
	}
})

.Join('duplicate', 20, {
	description: 'Duplicate the service under the target team.',
	requires: ['source'],
	out: {
		service: ['object']
	},
	callback: async function({ source, team_id })
	{
		const { service } = await this.Pipeline('services:duplicate', {
			id: source.Get('id'),
			team_id
		});

		return { service };
	}
});
