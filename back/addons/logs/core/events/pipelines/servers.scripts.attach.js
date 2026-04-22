import onetype from '@onetype/framework';

onetype.PipelineOn('commit', 'servers:scripts:attach', async function(pipeline, result, properties)
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
		action:         'servers.scripts.attach',
		level:          'Info',
		target_type:    'Server',
		target_id:      properties.server_id,
		reference_type: 'Script',
		reference_id:   properties.script_id,
		time:           Math.round(parseFloat(result.time))
	});
});

onetype.PipelineOn('rollback', 'servers:scripts:attach', async function(pipeline, result, properties, error)
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
		action:         'servers.scripts.attach',
		level:          'Error',
		target_type:    'Server',
		target_id:      properties.server_id,
		reference_type: 'Script',
		reference_id:   properties.script_id,
		code:           error.code,
		time:           Math.round(parseFloat(result.time)),
		output:         { message: error.message, join: error.join }
	});
});
