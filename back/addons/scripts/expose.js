import scripts from '#shared/scripts/addon.js';

scripts.Expose({
	filter: ['id', 'team_id', 'service_id', 'server_id', 'package_id', 'status', 'is_global', 'is_marketplace'],
	sort: ['name', 'created_at', 'updated_at'],
	select: [
		'id', 'team_id', 'service_id', 'server_id', 'package_id', 'name', 'description',
		'platforms', 'is_marketplace', 'is_global', 'autorun', 'loop',
		'output', 'bash', 'hash', 'metrics', 'status', 'updated_at', 'created_at'
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
