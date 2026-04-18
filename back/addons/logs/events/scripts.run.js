import onetype from '@onetype/framework';
import logs from '#shared/logs/addon.js';

onetype.EmitOn('scripts.run', async function({ server, script, result, time })
{
	const { code, data } = result;

	let level = 'Info';

	if(code !== 200)
	{
		level = 'Error';
	}
	else if(data.code !== 0)
	{
		level = 'Error';
	}
	else if(data.stderr)
	{
		level = 'Warn';
	}

	delete data.json;

	await logs.Fn('write', {
		team: server.Get('team_id'),
		server: server.Get('id'),
		script: script.Get('id'),
		source: 'Script',
		level,
		code,
		time,
		output: data
	});
});
