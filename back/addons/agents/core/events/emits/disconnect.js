import onetype from '@onetype/framework';

onetype.EmitOn('agents.grpc.disconnect', async ({ stream }) =>
{
	if(!stream.agent_id)
	{
		return;
	}

	const result = await onetype.PipelineRun('agents:disconnect', {
		agent_id: stream.agent_id,
		end:      false
	});

	console.log('[grpc] agent.disconnect pipeline →', result.code, result.message);
});
