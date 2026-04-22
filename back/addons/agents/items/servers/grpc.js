import onetype from '@onetype/framework';
import grpcServers from '@onetype/framework/servers/grpc';

grpcServers.Item(
{
	port: 50000,
	onStart: function()
	{
		console.log('[grpc] gateway listening on :50000');

		onetype.Emit('agents.grpc.start', { item: this });
	},

	onStreamConnect: async function(stream)
	{
		console.log('[grpc] stream connected', stream.id);

		const middleware = await onetype.Middleware('agents.grpc.connect', { stream, dropped: false });

		if(middleware.value.dropped)
		{
			stream.end();
			return;
		}

		onetype.Emit('agents.grpc.connect', { stream });
	},

	onStreamData: async function(stream, payload)
	{
		console.log('[grpc] <-', stream.id, payload.type + (payload.name ? ' ' + payload.name : ''), 'id=' + payload.id);

		const middleware = await onetype.Middleware('agents.grpc.message', { stream, payload, dropped: false });

		if(middleware.value.dropped)
		{
			return;
		}

		onetype.Emit('agents.grpc.message', { stream, payload });

		if(payload.type === 'event')
		{
			onetype.Emit('agents.grpc.event', { stream, payload, name: payload.name });
		}
	},

	onError: function(message)
	{
		console.error('[grpc] gateway error', message);

		onetype.Emit('agents.grpc.fatal', { message });

		throw onetype.Error(500, 'Gateway error: :message:.', { message });
	},

	onStreamError: function(stream, message)
	{
		console.error('[grpc] stream error', stream.id, message);

		onetype.Emit('agents.grpc.error', { stream, message });
	},

	onStreamEnd: function(stream)
	{
		console.log('[grpc] stream ended', stream.id, 'agent_id=', stream.agent_id);

		onetype.Emit('agents.grpc.disconnect', { stream });
	}
});
