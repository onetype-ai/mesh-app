import onetype from '@onetype/framework';
import logs from '#shared/logs/addon.js';

onetype.EmitOn('scripts.approval', async function({ server, script, result })
{
	await logs.Fn('write', {
		team: server.Get('team_id'),
		server: server.Get('id'),
		script: script.Get('id'),
		source: 'Script',
		level: 'Warn',
		code: result.code,
		output: result.data
	});
});
