import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import servers from '#shared/servers/addon.js';

commands.Item({
	id: 'agents:revoke',
	exposed: true,
	method: 'POST',
	endpoint: '/api/agents/revoke',
	in: {
		server:     ['string', null, true],
		hashes:     { type: 'array', value: [], each: ['string'], required: true },
		passphrase: ['string', null, true]
	},
	out: {
		count: ['number', 0]
	},
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const server = await servers.Find()
			.filter('id', properties.server)
			.filter('team_id', this.http.state.user.team.id)
			.filter('is_connected', true)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!server)
		{
			return resolve(null, 'Server not found or not connected.', 404);
		}

		const result = await onetype.PipelineRun('agents:revoke', {
			agent_id:   server.Get('id'),
			hashes:     properties.hashes,
			passphrase: properties.passphrase
		});

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		resolve({ count: result.data.count });
	}
});
