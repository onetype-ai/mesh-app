import packages from '#shared/packages/addon.js';

packages.Expose({
	filter: ['id', 'team_id', 'status', 'is_global', 'is_marketplace'],
	sort: ['name', 'created_at', 'updated_at'],
	select: [
		'id', 'team_id', 'name', 'description', 'version',
		'script_install_id', 'script_uninstall_id', 'script_status_id',
		'installed_condition',
		'platforms', 'is_marketplace', 'is_global', 'status',
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
