import grpcServers from '@onetype/framework/servers/grpc';
import servers from '#shared/servers/addon.js';

grpcServers.Item(
{
	port: 50000,

	onStart: function()
	{
		console.log('Mesh gateway running on :50000');
	},

	onStreamConnect: function(stream)
	{
		console.log('Agent connected');
	},

	onStreamData: async function(stream, payload)
	{
		/* ===== Guard: only handle requests ===== */
		if(payload.type !== 'request')
		{
			return;
		}

		/* ===== RPC: agent.register ===== */
		if(payload.name === 'agent.register')
		{
			const token = payload.data && payload.data.token;

			if(!token)
			{
				stream.respond({}, 'Token is required.', 400, true, payload.id);
				return;
			}

			/* ===== Reject duplicates: token already connected ===== */
			const existing = Object.values(servers.Items()).find((server) => server.Get('token') === token);

			if(existing)
			{
				stream.respond({}, 'Server already connected.', 409, true, payload.id);
				return;
			}

			const item = await servers.Find().filter('token', token).filter('deleted_at', null, 'NULL').one();

			if(!item)
			{
				stream.respond({}, 'Invalid token.', 401, true, payload.id);
				return;
			}

			item.Set('status', 'Active');
			item.Set('stream', stream);
			item.Set('exec', async function(command)
			{
				const result = await stream.request('agent.exec', { command });

				return {
					code: result.code,
					message: result.message,
					data: result.data || {}
				};
			});

			item.Set('approve', async function(passphrase, hashes)
			{
				const result = await stream.request('agent.approve', { passphrase, hashes });

				return {
					code: result.code,
					message: result.message,
					data: result.data || {}
				};
			});

			await item.Update();

			console.log('Agent registered:', item.Get('name'));

			stream.respond(
				{ server_id: item.Get('id'), name: item.Get('name') },
				'Registered',
				200,
				false,
				payload.id
			);

			stream.server = servers.Item(item.data);
			return;
		}

		/* ===== Fallback: unknown rpc ===== */
		stream.respond({}, 'Unknown rpc: ' + payload.name, 400, true, payload.id);
	},

	onError: function(message)
	{
		console.log('gRPC error:', message);
	},

	onStreamError: function(stream)
	{
		console.log('Stream error');
	},

	onStreamEnd: async function(stream)
	{
		/* ===== Cleanup: mark server Inactive, persist, remove from addon ===== */
		if(stream.server)
		{
			console.log('Agent disconnected:', stream.server.Get('name'));

			stream.server.Set('status', 'Inactive');
			await stream.server.Update();
			stream.server.Remove();
			return;
		}

		console.log('Agent disconnected');
	}
});
