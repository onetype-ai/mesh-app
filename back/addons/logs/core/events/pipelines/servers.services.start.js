import onetype from '@onetype/framework';

onetype.PipelineOn('commit', 'servers:services:start', async function(pipeline, result, properties)
{
	if(result.id.parent !== null)
	{
		return;
	}

	const user = this.state && this.state.user;

	await onetype.PipelineRun('logs:write', {
		team_id:        properties.team_id,
		user:           user ? { id: user.id, name: user.name, email: user.email } : null,
		correlation_id: result.id.root,
		action:         'servers.services.start',
		level:          'Info',
		target_type:    'Server',
		target_id:      properties.server_id,
		reference_type: 'Service',
		reference_id:   properties.service_id,
		time:           Math.round(parseFloat(result.time))
	});
});

onetype.PipelineOn('rollback', 'servers:services:start', async function(pipeline, result, properties, error)
{
	if(result.id.parent !== null)
	{
		return;
	}

	const user = this.state && this.state.user;

	await onetype.PipelineRun('logs:write', {
		team_id:        properties.team_id,
		user:           user ? { id: user.id, name: user.name, email: user.email } : null,
		correlation_id: result.id.root,
		action:         'servers.services.start',
		level:          'Error',
		target_type:    'Server',
		target_id:      properties.server_id,
		reference_type: 'Service',
		reference_id:   properties.service_id,
		code:           error.code,
		time:           Math.round(parseFloat(result.time)),
		output:         { message: error.message, join: error.join }
	});
});
