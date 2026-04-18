import commands from '@onetype/framework/commands';
import packages from '#shared/packages/addon.js';
import scripts from '#shared/scripts/addon.js';
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
	callback: async function(properties, resolve)
	{
		try
		{
			/* ===== Resolve server ===== */
			const server = Object.values(servers.Items()).find((item) => String(item.Get('id')) === String(properties.server));

			if(!server || !server.Get('stream'))
			{
				return resolve(null, 'Server not connected.', 404);
			}

			/* ===== Resolve package ===== */
			const pkg = await packages.Find().filter('id', properties.package).one();

			if(!pkg)
			{
				return resolve(null, 'Package not found.', 404);
			}

			const uninstallId = pkg.Get('script_uninstall_id');
			const statusId = pkg.Get('script_status_id');

			if(!uninstallId)
			{
				return resolve(null, 'Package has no uninstall script.', 400);
			}

			/* ===== Resolve uninstall script ===== */
			const uninstallScript = await scripts.Find().filter('id', uninstallId).one();

			if(!uninstallScript)
			{
				return resolve(null, 'Uninstall script not found.', 404);
			}

			/* ===== Run uninstall ===== */
			const uninstallResult = await scripts.Fn('item.run', uninstallScript, server);

			/* ===== Run status (to refresh metrics) ===== */
			if(statusId)
			{
				const statusScript = await scripts.Find().filter('id', statusId).one();

				if(statusScript)
				{
					await scripts.Fn('item.run', statusScript, server);
				}
			}

			resolve(uninstallResult);
		}
		catch(error)
		{
			resolve(null, error.message, 500);
		}
	}
});
