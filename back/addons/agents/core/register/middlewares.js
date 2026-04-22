import onetype from '@onetype/framework';

onetype.MiddlewareRegister('agents.grpc.connect', {
	description: 'Runs before a new gRPC stream is accepted. Plugins can set value.dropped = true to close the stream (e.g. IP blacklist, auth).',
	config: {
		stream:  ['object', null, true],
		dropped: ['boolean', false]
	}
});

onetype.MiddlewareRegister('agents.grpc.message', {
	description: 'Runs for every incoming gRPC payload before it is dispatched. Plugins can set value.dropped = true to stop processing (e.g. rate limit, encryption).',
	config: {
		stream:  ['object', null, true],
		payload: ['object', null, true],
		dropped: ['boolean', false]
	}
});
