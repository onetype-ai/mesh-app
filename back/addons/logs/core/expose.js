import logs from '#shared/logs/addon.js';

logs.Expose({
	filter: ['id', 'team_id', 'server_id', 'script_id', 'user_id', 'level', 'source'],
	sort: ['created_at', 'updated_at'],
	select: [
		'id', 'team_id', 'server_id', 'script_id', 'user_id',
		'level', 'source', 'code', 'time', 'output',
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
