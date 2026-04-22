import servers from '#shared/servers/addon.js';

servers.Expose({
	filter: ['id', 'team_id', 'status'],
	sort: ['name', 'created_at', 'updated_at'],
	select: [
		'id', 'team_id', 'name', 'token',
		'metrics', 'system_static', 'system_dynamic', 'system_refresh', 'status', 'is_initialized',
		'updated_at', 'created_at'
	],
	find: function(query)
	{
		if(!this.http.state.user)
		{
			return 'Login required.';
		}

		query.filter('team_id', this.http.state.user.team.id);
		query.filter('deleted_at', null, 'NULL');

		return true;
	}
});