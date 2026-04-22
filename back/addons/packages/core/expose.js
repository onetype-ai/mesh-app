import packages from '#shared/packages/addon.js';

packages.Expose({
	filter: ['id', 'team_id', 'status', 'is_marketplace', 'is_verified'],
	sort: ['name', 'created_at', 'updated_at'],
	select: [
		'id', 'team_id', 'name', 'description', 'overview', 'version',
		'script_install_id', 'script_uninstall_id', 'script_status_id',
		'config', 'installed_condition',
		'platforms', 'is_marketplace', 'is_verified', 'status',
		'updated_at', 'created_at'
	],
	find: function(query)
	{
		if(!this.http.state.user)
		{
			return 'Login required.';
		}

		query.filter('deleted_at', null, 'NULL');

		query.group('AND')
			.filter('team_id', this.http.state.user.team.id)
			.group('OR')
				.filter('is_marketplace', true)
				.filter('status', 'Published')
			.end()
		.end();

		return true;
	}
});
