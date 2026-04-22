import onetype from '@onetype/framework';

onetype.PipelineOn('commit', 'marketplace:import:package', async function(pipeline, result, properties)
{
	if(result.id.parent !== null)
	{
		return;
	}

	const pkg    = properties.package;
	const source = properties.source;
	const user   = this.state && this.state.user;

	await onetype.PipelineRun('logs:write', {
		team_id:        properties.team_id,
		user:           user ? { id: user.id, name: user.name, email: user.email } : null,
		correlation_id: result.id.root,
		action:         'marketplace.package.import',
		level:          'Info',
		target_type:    'Package',
		target_id:      pkg ? pkg.Get('id') : null,
		reference_type: 'Package',
		reference_id:   source ? source.Get('id') : properties.package_id,
		time:           Math.round(parseFloat(result.time))
	});
});

onetype.PipelineOn('rollback', 'marketplace:import:package', async function(pipeline, result, properties, error)
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
		action:         'marketplace.package.import',
		level:          'Error',
		target_type:    'Package',
		reference_type: 'Package',
		reference_id:   properties.package_id,
		code:           error.code,
		time:           Math.round(parseFloat(result.time)),
		output:         { message: error.message, join: error.join }
	});
});
