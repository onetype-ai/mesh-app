import onetype from '@onetype/framework';

onetype.PipelineOn('commit', 'scripts:publish', async function(pipeline, result, properties)
{
	if(result.id.parent !== null)
	{
		return;
	}

	const item = properties.item;
	const user = this.state && this.state.user;

	await onetype.PipelineRun('logs:write', {
		team_id:        item ? item.Get('team_id') : null,
		user:           user ? { id: user.id, name: user.name, email: user.email } : null,
		correlation_id: result.id.root,
		action:         'scripts.publish',
		level:          'Info',
		target_type:    'Script',
		target_id:      properties.id,
		time:           Math.round(parseFloat(result.time))
	});
});

onetype.PipelineOn('rollback', 'scripts:publish', async function(pipeline, result, properties, error)
{
	if(result.id.parent !== null)
	{
		return;
	}

	const item = properties.item;
	const user = this.state && this.state.user;

	await onetype.PipelineRun('logs:write', {
		team_id:        item ? item.Get('team_id') : null,
		user:           user ? { id: user.id, name: user.name, email: user.email } : null,
		correlation_id: result.id.root,
		action:         'scripts.publish',
		level:          'Error',
		target_type:    'Script',
		target_id:      properties.id,
		code:           error.code,
		time:           Math.round(parseFloat(result.time)),
		output:         { message: error.message, join: error.join }
	});
});
