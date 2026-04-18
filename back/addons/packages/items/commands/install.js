import commands from '@onetype/framework/commands';
import packages from '#shared/packages/addon.js';
import scripts from '#shared/scripts/addon.js';
import servers from '#shared/servers/addon.js';

commands.Item({
	id: 'packages:install',
	exposed: true,
	method: 'POST',
	endpoint: '/api/packages/install',
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

			const installId = pkg.Get('script_install_id');
			const statusId = pkg.Get('script_status_id');

			if(!installId)
			{
				return resolve(null, 'Package has no install script.', 400);
			}

			/* ===== Resolve install script ===== */
			const installScript = await scripts.Find().filter('id', installId).one();

			if(!installScript)
			{
				return resolve(null, 'Install script not found.', 404);
			}

			/* ===== Run install ===== */
			const installResult = await scripts.Fn('item.run', installScript, server);

			/* ===== Run status (to refresh metrics) ===== */
			if(statusId)
			{
				const statusScript = await scripts.Find().filter('id', statusId).one();

				if(statusScript)
				{
					await scripts.Fn('item.run', statusScript, server);
				}
			}

			resolve(installResult);
		}
		catch(error)
		{
			resolve(null, error.message, 500);
		}
	}
});
