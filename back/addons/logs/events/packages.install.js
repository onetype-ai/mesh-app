import onetype from '@onetype/framework';
import logs from '#shared/logs/addon.js';

onetype.EmitOn('servers.packages.install', async function({ server, package: item, installed })
{
	const level = installed ? 'Info' : 'Error';
	const message = installed
		? 'Installed ' + item.Get('name') + '.'
		: 'Failed to install ' + item.Get('name') + '.';

	console.log('Package install:', item.Get('name'), 'on', server.Get('name'), '[' + level + ']');

	await logs.Fn('write', {
		team: server.Get('team_id'),
		server: server.Get('id'),
		source: 'System',
		level,
		output: { message }
	});
});
