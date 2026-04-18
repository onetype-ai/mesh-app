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
		query.filter('deleted_at', null, 'NULL');
		return true;
	},
	create: function()
	{
		return this.http.state.user ? true : 'Login required.';
	},
	update: function()
	{
		return this.http.state.user ? true : 'Login required.';
	},
	delete: function()
	{
		return this.http.state.user ? true : 'Login required.';
	}
});
