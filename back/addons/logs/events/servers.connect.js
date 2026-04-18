import onetype from '@onetype/framework';
import logs from '#shared/logs/addon.js';

onetype.EmitOn('servers.connect', async function({ server })
{
	await logs.Fn('write', {
		team: server.Get('team_id'),
		server: server.Get('id'),
		source: 'Agent',
		level: 'Info',
		output: { message: 'Agent connected.' }
	});
});
