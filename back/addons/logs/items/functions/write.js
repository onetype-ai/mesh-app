import logs from '#shared/logs/addon.js';

logs.Fn('write', async function(properties)
{
	const item = logs.Item({
		team_id: properties.team,
		server_id: properties.server,
		script_id: properties.script,
		user_id: properties.user,
		level: properties.level,
		source: properties.source,
		code: properties.code,
		time: properties.time,
		output: properties.output
	});

	await item.Create();

	return item;
});
