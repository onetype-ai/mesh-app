import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:packages:uninstall',
	exposed: true,
	method: 'POST',
	endpoint: '/api/servers/packages/uninstall',
	in: {
		server_id: ['string', null, true],
		package_id: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const result = await onetype.PipelineRun('servers:packages:uninstall', {
			server_id: properties.server_id,
			package_id: properties.package_id,
			team_id: this.http.state.user.team.id
		});

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		resolve({});
	}
});
