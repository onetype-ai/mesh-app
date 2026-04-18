import onetype from '@onetype/framework';
import logs from '#shared/logs/addon.js';

onetype.EmitOn('packages.uninstall', async function({ server, package: item, code, result, time })
{
	const success = code === 200 && result.data.code === 0;
	const level = success ? 'Info' : 'Error';
	const message = success
		? 'Uninstalled ' + item.Get('name') + '.'
		: 'Failed to uninstall ' + item.Get('name') + '.';

	await logs.Fn('write', {
		team: server.Get('team_id'),
		server: server.Get('id'),
		source: 'System',
		level,
		code,
		time,
		output: { message }
	});
});
