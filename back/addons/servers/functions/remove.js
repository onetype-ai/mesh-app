import onetype from '@onetype/framework';
import servers from '#shared/servers/addon.js';

servers.Fn('remove', async function(server, cleanup = false)
{
	await onetype.Middleware('servers.remove.before', { server, cleanup });

	server.Set('deleted_at', new Date().toISOString());
	await server.Update();

	await onetype.Middleware('servers.remove.after', { server, cleanup });

	onetype.Emit('servers.remove', { server, cleanup });

	return server;
});
