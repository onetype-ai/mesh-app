import onetype from '@onetype/framework';
import servers from '#shared/servers/addon.js';

onetype.MiddlewareIntercept('shutdown', async (middleware) =>
{
	const items = Object.values(servers.Items());

	console.log('Shutdown: marking ' + items.length + ' server(s) Inactive');

	for(const item of items)
	{
		item.Set('status', 'Inactive');

		await item.Update();

		const stream = item.Get('stream');

		if(stream && typeof stream.end === 'function')
		{
			stream.end();
		}

		console.log('Shutdown: ' + item.Get('name') + ' marked Inactive');
	}

	await middleware.next();
});
