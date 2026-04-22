import scripts from '#shared/scripts/addon.js';

scripts.Expose({
	filter: ['id', 'team_id', 'service_id', 'server_id', 'package_id', 'status', 'is_marketplace', 'is_verified'],
	sort: ['name', 'created_at', 'updated_at'],
	select: [
		'id', 'team_id', 'service_id', 'server_id', 'package_id', 'name', 'description',
		'platforms', 'is_marketplace', 'is_verified', 'autorun', 'loop',
		'output', 'bash', 'hash', 'config', 'metrics', 'status', 'updated_at', 'created_at'
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
