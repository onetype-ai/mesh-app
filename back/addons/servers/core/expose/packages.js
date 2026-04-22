import servers from '#shared/servers/addon.js';

servers.packages.Expose({
	filter: ['id', 'team_id', 'server_id', 'package_id'],
	sort: ['created_at', 'updated_at'],
	select: ['id', 'team_id', 'server_id', 'package_id', 'config', 'updated_at', 'created_at'],
	find: function(query)
	{
		if(!this.http.state.user)
		{
			return 'Login required.';
		}

		query.filter('deleted_at', null, 'NULL');
		query.filter('team_id', this.http.state.user.team.id);

		return true;
	}
});
