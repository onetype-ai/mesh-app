import onetype from '@onetype/framework';
import logs from '#shared/logs/addon.js';

onetype.EmitOn('servers.packages.uninstall', async function({ server, package: item, uninstalled })
{
	const level = uninstalled ? 'Info' : 'Error';
	const message = uninstalled
		? 'Uninstalled ' + item.Get('name') + '.'
		: 'Failed to uninstall ' + item.Get('name') + '.';

	console.log('Package uninstall:', item.Get('name'), 'on', server.Get('name'), '[' + level + ']');

	await logs.Fn('write', {
		team: server.Get('team_id'),
		server: server.Get('id'),
		source: 'System',
		level,
		output: { message }
	});
});
