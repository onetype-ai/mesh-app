import servers from '#shared/servers/addon.js';
import scripts from '#shared/scripts/addon.js';

servers.ItemOn('add', async function(server)
{
	const intervals = [];

	for(const script of Object.values(scripts.Items()))
	{
		if(!script.Get('is_global'))
		{
			continue;
		}

		/* ===== Autorun: one-shot at connect ===== */
		if(script.Get('autorun'))
		{
			await scripts.Fn('item.run', script, server);
		}

		/* ===== Loop: periodic while connected ===== */
		const loop = script.Get('loop');

		if(loop)
		{
			console.log('Loop start:', script.Get('name'), 'every', loop + 'ms');

			const interval = setInterval(async () =>
			{
				try
				{
					await scripts.Fn('item.run', script, server);
					console.log('Loop tick:', script.Get('name'));
				}
				catch(error)
				{
					console.warn('Loop script failed:', script.Get('name'), error.message);
				}
			}, loop);

			intervals.push(interval);
		}
	}

	server.Set('intervals', intervals);
});

servers.ItemOn('remove', function(server)
{
	const intervals = server.Get('intervals') || [];

	for(const interval of intervals)
	{
		clearInterval(interval);
	}
});
