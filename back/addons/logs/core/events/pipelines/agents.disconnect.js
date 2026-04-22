import onetype from '@onetype/framework';

onetype.PipelineOn('commit', 'agents:disconnect', async function(pipeline, result, properties)
{
	if(result.id.parent !== null)
	{
		return;
	}

	const agent = properties.agent;

	if(!agent)
	{
		return;
	}

	const server = await agent.Get('server')();

	if(!server)
	{
		return;
	}

	await onetype.PipelineRun('logs:write', {
		team_id:        server.Get('team_id'),
		correlation_id: result.id.root,
		action:         'servers.disconnect',
		level:          'Info',
		target_type:    'Server',
		target_id:      server.Get('id'),
		time:           Math.round(parseFloat(result.time))
	});
});

onetype.PipelineOn('rollback', 'agents:disconnect', async function(pipeline, result, properties, error)
{
	if(result.id.parent !== null)
	{
		return;
	}

	const agent = properties.agent;

	if(!agent)
	{
		return;
	}

	const server = await agent.Get('server')();

	if(!server)
	{
		return;
	}

	await onetype.PipelineRun('logs:write', {
		team_id:        server.Get('team_id'),
		correlation_id: result.id.root,
		action:         'servers.disconnect',
		level:          'Error',
		target_type:    'Server',
		target_id:      server.Get('id'),
		code:           error.code,
		time:           Math.round(parseFloat(result.time)),
		output:         { message: error.message, join: error.join }
	});
});
