import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:packages:install',
	exposed: true,
	method: 'POST',
	endpoint: '/api/servers/packages/install',
	in: {
		server_id: ['string', null, true],
		package_id: ['string', null, true]
	},
	out: 'servers.package',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const result = await onetype.PipelineRun('servers:packages:install', {
			server_id: properties.server_id,
			package_id: properties.package_id,
			team_id: this.http.state.user.team.id
		});

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		resolve(result.data.link.GetData());
	}
});
