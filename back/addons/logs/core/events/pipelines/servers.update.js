import onetype from '@onetype/framework';

onetype.PipelineOn('commit', 'servers:update', async function(pipeline, result, properties)
{
	if(result.id.parent !== null)
	{
		return;
	}

	const server      = properties.server;
	const user        = this.state && this.state.user;
	const actor_ip    = this.state && this.state.actor_ip    ? this.state.actor_ip    : null;
	const actor_agent = this.state && this.state.actor_agent ? this.state.actor_agent : null;

	const team_id = server ? server.Get('team_id') : null;
	const action  = 'servers.update';

	await onetype.PipelineRun('logs:write', {
		team_id,
		user:           user ? { id: user.id, name: user.name, email: user.email } : null,
		actor_ip,
		actor_agent,
		correlation_id: result.id.root,
		action,
		level:          'Info',
		target_type:    'Server',
		target_id:      properties.id,
		time:           Math.round(parseFloat(result.time)),
		output:         { changes: properties.allowed }
	}, { lock: 'logs:write:' + team_id + ':' + action });
});

onetype.PipelineOn('rollback', 'servers:update', async function(pipeline, result, properties, error)
{
	if(result.id.parent !== null)
	{
		return;
	}

	const server      = properties.server;
	const user        = this.state && this.state.user;
	const actor_ip    = this.state && this.state.actor_ip    ? this.state.actor_ip    : null;
	const actor_agent = this.state && this.state.actor_agent ? this.state.actor_agent : null;

	const team_id = server ? server.Get('team_id') : null;
	const action  = 'servers.update';

	await onetype.PipelineRun('logs:write', {
		team_id,
		user:           user ? { id: user.id, name: user.name, email: user.email } : null,
		actor_ip,
		actor_agent,
		correlation_id: result.id.root,
		action,
		level:          'Error',
		target_type:    'Server',
		target_id:      properties.id,
		code:           error.code,
		time:           Math.round(parseFloat(result.time)),
		output:         { message: error.message, join: error.join }
	}, { lock: 'logs:write:' + team_id + ':' + action });
});
