import onetype from '@onetype/framework';
import agents from '#agents/addon.js';
import servers from '#shared/servers/addon.js';


onetype.Pipeline('agents:connect', {
	description: 'Register an agent after a successful gRPC handshake.',
	timeout: 30000,
	in: {
		token: ['string', null, true],
		stream: ['object', null, true],
		request_id: ['string', null, true]
	}
})

.Join('validate', 10, {
	description: 'Token format check.',
	callback: async ({ token }, resolve) =>
	{
		if(typeof token !== 'string' || token.length !== 64)
		{
			return resolve(null, 'Invalid token.', 400);
		}
	}
})

.Join('server', 20, {
	description: 'Load the server by token.',
	out: {
		server: ['object']
	},
	callback: async ({ token, stream, request_id }, resolve) =>
	{
		const server = await servers.Find()
			.filter('token', token)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!server)
		{
			stream.respond({}, 'Server not found.', 404, true, request_id);
			stream.end();
			return resolve(null, 'Server not found.', 404);
		}

		return { server };
	}
})

.Join('agent', 30, {
	description: 'Register the agent item with lazy server + stream accessors.',
	requires: ['server'],
	out: {
		agent: ['object']
	},
	callback: async ({ server, stream }, resolve) =>
	{
		if(agents.ItemGet(server.Get('id')))
		{
			stream.end();
			return resolve(null, 'Agent already connected.', 409);
		}

		const cache = { server: null, time: 0 };

		const agent = agents.Item({
			id: server.Get('id'),
			server: async () =>
			{
				if(cache.server && Date.now() - cache.time < 10000)
				{
					return cache.server;
				}

				const item = await servers.Find().filter('id', server.Get('id')).filter('deleted_at', null, 'NULL').one();

				if(!item)
				{
					throw onetype.Error(404, 'Server :id: not found.', { id: server.Get('id') }, true);
				}

				cache.server = item;
				cache.time = Date.now();

				return item;
			},
			stream: () => stream,
			bash: (command, passphrase) => stream.request('agent.bash', { command, passphrase }, null, null, 1800000),
			approve: (hashes, passphrase) => stream.request('agent.approve', { hashes, passphrase })
		});

		stream.agent_id = agent.Get('id');

		return { agent };
	},
	rollback: async ({ agent }) =>
	{
		if(agent)
		{
			agent.Remove();
		}
	}
})

.Join('status', 40, {
	description: 'Mark the server Active.',
	requires: ['server'],
	callback: async ({ server }) =>
	{
		server.Set('status', 'Active');
		await server.Update({ whitelist: ['status'] });
	},
	rollback: async ({ server }) =>
	{
		if(!server)
		{
			return;
		}

		server.Set('status', 'Inactive');
		await server.Update({ whitelist: ['status'] });
	}
})

.Join('respond', 50, {
	description: 'Acknowledge the handshake over the gRPC stream.',
	requires: ['server', 'agent'],
	callback: async ({ server, stream, request_id }) =>
	{
		stream.respond({ server_id: server.Get('id'), name: server.Get('name') }, 'Connected.', 200, true, request_id);
	}
})

.Join('static', 60, {
	description: 'Collect static system information once.',
	requires: ['agent'],
	callback: async function({ agent })
	{
		await this.Pipeline('agents:metrics.static', { agent_id: agent.Get('id') });
	}
})

.Join('tick', 70, {
	description: 'Schedule the dynamic metrics polling loop on the agent.',
	requires: ['agent'],
	callback: async ({ agent }) =>
	{
		const intervals = agent.Get('intervals');

		const tick = async () =>
		{
			if(!agents.ItemGet(agent.Get('id')))
			{
				return;
			}

			await onetype.PipelineRun('agents:metrics.dynamic', { agent_id: agent.Get('id') });

			if(!agents.ItemGet(agent.Get('id')))
			{
				return;
			}

			const server = await agent.Get('server')();
			const refresh = server.Get('system_refresh');

			intervals.system_refresh = setTimeout(tick, refresh * 1000);
		};

		intervals.system_refresh = setTimeout(tick, 0);
	}
});
