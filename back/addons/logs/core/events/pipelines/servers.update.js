import onetype from '@onetype/framework';

onetype.PipelineOn('commit', 'servers:update', async function(pipeline, result, properties)
{
	if(result.id.parent !== null)
	{
		return;
	}

	const server = properties.server;
	const user   = this.state && this.state.user;

	await onetype.PipelineRun('logs:write', {
		team_id:        server ? server.Get('team_id') : null,
		user:           user ? { id: user.id, name: user.name, email: user.email } : null,
		correlation_id: result.id.root,
		action:         'servers.update',
		level:          'Info',
		target_type:    'Server',
		target_id:      properties.id,
		time:           Math.round(parseFloat(result.time)),
		output:         { changes: properties.allowed }
	});
});

onetype.PipelineOn('rollback', 'servers:update', async function(pipeline, result, properties, error)
{
	if(result.id.parent !== null)
	{
		return;
	}

	const server = properties.server;
	const user   = this.state && this.state.user;

	await onetype.PipelineRun('logs:write', {
		team_id:        server ? server.Get('team_id') : null,
		user:           user ? { id: user.id, name: user.name, email: user.email } : null,
		correlation_id: result.id.root,
		action:         'servers.update',
		level:          'Error',
		target_type:    'Server',
		target_id:      properties.id,
		code:           error.code,
		time:           Math.round(parseFloat(result.time)),
		output:         { message: error.message, join: error.join }
	});
});
