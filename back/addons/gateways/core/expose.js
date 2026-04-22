import gateways from '#shared/gateways/addon.js';

gateways.Expose({
	filter: ['id', 'status'],
	sort: ['name', 'created_at', 'updated_at'],
	select: [
		'id', 'name', 'host', 'port', 'status',
		'updated_at', 'created_at'
	],
	find: function(query)
	{
		if(!this.http.state.user)
		{
			return 'Login required.';
		}

		query.filter('deleted_at', null, 'NULL');

		return true;
	}
});
