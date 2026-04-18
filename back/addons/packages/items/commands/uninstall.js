import commands from '@onetype/framework/commands';
import packages from '#shared/packages/addon.js';
import servers from '#shared/servers/addon.js';

commands.Item({
	id: 'packages:uninstall',
	exposed: true,
	method: 'POST',
	endpoint: '/api/packages/uninstall',
	in: {
		server: ['string', null, true],
		package: ['string', null, true],
		passphrase: ['string', '']
	},
	out: {
		installed: ['boolean', false, true]
	},
	callback: async function(properties, resolve)
	{
		try
		{
			const server = Object.values(servers.Items()).find((item) => String(item.Get('id')) === String(properties.server));

			if(!server || !server.Get('stream'))
			{
				return resolve(null, 'Server not connected.', 404);
			}

			const item = await packages.Find().filter('id', properties.package).one();

			if(!item)
			{
				return resolve(null, 'Package not found.', 404);
			}

			const result = await packages.Fn('uninstall', item, server);
			const installed = !(result.code === 200 && result.data.code === 0);

			resolve({ installed });
		}
		catch(error)
		{
			resolve(null, error.message, error.code || 500);
		}
	}
});
