import commands from '@onetype/framework/commands';
import services from '#shared/services/addon.js';

commands.Item({
	id: 'services:many',
	exposed: true,
	method: 'GET',
	endpoint: '/api/services',
	in: 'query',
	out: {
		items:
		{
			type: 'array',
			value: [],
			each: { type: 'object', config: 'service' }
		},
		total: ['number', 0, true],
		page: ['number', 1, true],
		limit: ['number', 10, true]
	},
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const query = services.Find().filter('team_id', this.http.state.user.team.id);

		for(const filter of properties.filters || [])
		{
			query.filter(filter.field, filter.value, filter.operator);
		}

		if(properties.sort_field)
		{
			query.sort(properties.sort_field, properties.sort_direction);
		}

		query.limit(properties.limit).page(properties.page);

		const [items, total] = await Promise.all([
			query.many(),
			services.Find().filter('team_id', this.http.state.user.team.id).count()
		]);

		resolve({
			items: items.map((item) => item.GetData()),
			total,
			page: properties.page,
			limit: properties.limit
		});
	}
});
