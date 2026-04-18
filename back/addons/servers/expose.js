import servers from '#shared/servers/addon.js';

servers.Expose({
	filter: ['id', 'team_id', 'ip'],
	sort: ['name', 'created_at', 'updated_at'],
	select: [
		'id', 'team_id', 'name', 'ip', 'token',
		'metrics', 'status', 'updated_at', 'created_at'
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
