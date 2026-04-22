import onetype from '@onetype/framework';

onetype.PipelineOn('commit', 'marketplace:import:script', async function(pipeline, result, properties)
{
	if(result.id.parent !== null)
	{
		return;
	}

	const script = properties.script;
	const source = properties.source;
	const user   = this.state && this.state.user;

	await onetype.PipelineRun('logs:write', {
		team_id:        properties.team_id,
		user:           user ? { id: user.id, name: user.name, email: user.email } : null,
		correlation_id: result.id.root,
		action:         'marketplace.script.import',
		level:          'Info',
		target_type:    'Script',
		target_id:      script ? script.Get('id') : null,
		reference_type: 'Script',
		reference_id:   source ? source.Get('id') : properties.script_id,
		time:           Math.round(parseFloat(result.time))
	});
});

onetype.PipelineOn('rollback', 'marketplace:import:script', async function(pipeline, result, properties, error)
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
		action:         'marketplace.script.import',
		level:          'Error',
		target_type:    'Script',
		reference_type: 'Script',
		reference_id:   properties.script_id,
		code:           error.code,
		time:           Math.round(parseFloat(result.time)),
		output:         { message: error.message, join: error.join }
	});
});
