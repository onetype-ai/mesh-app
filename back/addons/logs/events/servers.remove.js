import onetype from '@onetype/framework';
import logs from '#shared/logs/addon.js';

onetype.EmitOn('servers.remove', async function({ server, cleanup })
{
	await logs.Fn('write', {
		team: server.Get('team_id'),
		server: server.Get('id'),
		source: 'System',
		level: 'Info',
		output: { message: 'Server removed: ' + server.Get('name') + '.', cleanup }
	});
});
