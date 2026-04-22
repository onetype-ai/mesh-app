import onetype from '@onetype/framework';

onetype.PipelineOn('commit', 'servers:create', async function(pipeline, result, properties)
{
	if(result.id.parent !== null)
	{
		return;
	}

	const server = properties.server;
	const user   = this.state && this.state.user;

	await onetype.PipelineRun('logs:write', {
		team_id:        properties.team_id,
		user:           user ? { id: user.id, name: user.name, email: user.email } : null,
		correlation_id: result.id.root,
		action:         'servers.create',
		level:          'Info',
		target_type:    'Server',
		target_id:      server ? server.Get('id') : null,
		time:           Math.round(parseFloat(result.time)),
		output:         { name: properties.name }
	});
});

onetype.PipelineOn('rollback', 'servers:create', async function(pipeline, result, properties, error)
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
		action:         'servers.create',
		level:          'Error',
		target_type:    'Server',
		code:           error.code,
		time:           Math.round(parseFloat(result.time)),
		output:         { name: properties.name, message: error.message, join: error.join }
	});
});
