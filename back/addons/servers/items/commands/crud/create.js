import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:create',
	exposed: true,
	method: 'POST',
	endpoint: '/api/servers',
	in: {
		name: ['string', null, true],
		scripts: { type: 'array', value: [], each: ['string'] },
		packages: { type: 'array', value: [], each: ['string'] },
		services: { type: 'array', value: [], each: ['string'] }
	},
	out: 'server',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const result = await onetype.PipelineRun('servers:create', {
			team_id: this.http.state.user.team.id,
			name: properties.name,
			scripts: properties.scripts,
			packages: properties.packages,
			services: properties.services
		}, { state: this.http.state });

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		const data = result.data.server.GetData();

		delete data.token;

		resolve(data);
	}
});
