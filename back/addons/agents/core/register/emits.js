import onetype from '@onetype/framework';

onetype.EmitRegister('agents.grpc.start', {
	description: 'Fired when the gRPC gateway server starts listening.',
	config: {}
});

onetype.EmitRegister('agents.grpc.connect', {
	description: 'Fired when a new gRPC stream opens (before the agent registers).',
	config: {
		stream: ['object', null, true]
	}
});

onetype.EmitRegister('agents.grpc.message', {
	description: 'Fired for every incoming gRPC payload — requests, responses and events.',
	config: {
		stream:  ['object', null, true],
		payload: ['object', null, true]
	}
});

onetype.EmitRegister('agents.grpc.event', {
	description: 'Fired for fire-and-forget events from the agent (payload.type === "event"). Plugins like terminal subscribe here.',
	config: {
		stream:  ['object', null, true],
		payload: ['object', null, true],
		name:    ['string', null, true]
	}
});

onetype.EmitRegister('agents.grpc.error', {
	description: 'Fired when a single stream encounters an error.',
	config: {
		stream:  ['object', null, true],
		message: ['string']
	}
});

onetype.EmitRegister('agents.grpc.disconnect', {
	description: 'Fired when a gRPC stream closes. Agent item may still be registered at this point.',
	config: {
		stream: ['object', null, true]
	}
});

onetype.EmitRegister('agents.grpc.fatal', {
	description: 'Fired when the gRPC gateway itself encounters a fatal error.',
	config: {
		message: ['string']
	}
});
