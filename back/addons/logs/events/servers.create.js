import onetype from '@onetype/framework';
import logs from '#shared/logs/addon.js';

onetype.EmitOn('servers.create', async function({ server })
{
	await logs.Fn('write', {
		team: server.Get('team_id'),
		server: server.Get('id'),
		source: 'System',
		level: 'Info',
		output: { message: 'Server created: ' + server.Get('name') + '.' }
	});
});
