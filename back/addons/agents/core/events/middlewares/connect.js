import onetype from '@onetype/framework';

onetype.MiddlewareIntercept('agents.grpc.message', async (middleware) =>
{
	const { stream, payload } = middleware.value;

	/* Already-registered streams pass through without further checks. */
	if(stream.agent_id)
	{
		return await middleware.next();
	}

	/* Anonymous streams may only send agent.connect. Anything else is dropped. */
	if(payload.type !== 'request' || payload.name !== 'agent.connect')
	{
		console.log('[grpc] anonymous stream sent', payload.type, payload.name, '— dropped');
		middleware.value.dropped = true;
		stream.respond({}, 'Not authenticated.', 401, true, payload.id);
		return;
	}

	const token = payload.data && payload.data.token;

	if(typeof token !== 'string' || token.length !== 64)
	{
		console.log('[grpc] agent.connect rejected — bad token');
		middleware.value.dropped = true;
		stream.respond({}, 'Invalid token.', 400, true, payload.id);
		stream.end();
		return;
	}

	const result = await onetype.PipelineRun('agents:connect', {
		token,
		stream,
		request_id: payload.id
	}, { lock: token });

	console.log('[grpc] agent.connect pipeline →', result.code, result.message);

	if(result.code !== 200)
	{
		middleware.value.dropped = true;
		return;
	}

	await middleware.next();
});
