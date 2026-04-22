import onetype from '@onetype/framework';
import grpcServers from '@onetype/framework/servers/grpc';

grpcServers.Item(
{
	port: 50000,
	onStart: function()
	{
		console.log('[grpc] gateway listening on :50000');
	},
	onStreamConnect: function(stream)
	{
		console.log('[grpc] stream connected', stream.id);
	},
	onStreamData: async function(stream, payload)
	{
		console.log('[grpc] <-', stream.id, payload.type + (payload.name ? ' ' + payload.name : ''), 'id=' + payload.id);

		/* ===== Guard: only handle requests ===== */
		if(payload.type !== 'request')
		{
			return;
		}

		/* ===== RPC: agent.connect ===== */
		if(payload.name === 'agent.connect')
		{
			const token = payload.data.token;

			if(typeof token !== 'string' || token.length !== 64)
			{
				console.log('[grpc] agent.connect rejected — bad token');
				stream.respond({}, 'Invalid token.', 400, true, payload.id);
				stream.end();
				return;
			}

			const result = await onetype.PipelineRun('agents:connect', { token, stream, request_id: payload.id }, { lock: token });
			console.log('[grpc] agent.connect pipeline →', result.code, result.message);
		}

		/* ===== Fallback: unknown rpc ===== */
		else
		{
			console.log('[grpc] unknown rpc', payload.name);
			stream.respond({}, 'Unknown rpc: ' + payload.name, 400, true, payload.id);
		}
	},

	onError: function(message)
	{
		console.error('[grpc] gateway error', message);
		throw onetype.Error(500, 'Gateway error: :message:.', { message });
	},

	onStreamError: function(stream, message)
	{
		console.error('[grpc] stream error', stream.id, message);
	},

	onStreamEnd: async function(stream)
	{
		console.log('[grpc] stream ended', stream.id, 'agent_id=', stream.agent_id);

		if(!stream.agent_id)
		{
			return;
		}

		const result = await onetype.PipelineRun('agents:disconnect', { agent_id: stream.agent_id, end: false });
		console.log('[grpc] agent.disconnect pipeline →', result.code, result.message);
	}
});
