import commands from '@onetype/framework/commands';
import scripts from '#shared/scripts/addon.js';
import servers from '#shared/servers/addon.js';

commands.Item({
	id: 'scripts:run',
	exposed: true,
	method: 'POST',
	endpoint: '/api/scripts/run',
	in: {
		server: ['string', null, true],
		script: ['string', null, true],
		passphrase: ['string', '']
	},
	callback: async function(properties, resolve)
	{
		try
		{
			/* ===== Resolve server from runtime addon (active stream) ===== */
			const server = Object.values(servers.Items()).find((s) => String(s.Get('id')) === String(properties.server));

			if(!server || !server.Get('stream'))
			{
				return resolve(null, 'Server not connected.', 404);
			}

			/* ===== Resolve script ===== */
			const script = scripts.Item(properties.script);

			if(!script)
			{
				return resolve(null, 'Script not found.', 404);
			}

			/* ===== Approve this script's hash with passphrase (if any) ===== */
			// if(properties.passphrase)
			// {
			// 	const approve = server.Get('approve');
			//
			// 	if(typeof approve === 'function')
			// 	{
			// 		const approval = await approve(properties.passphrase, [script.Get('hash')]);
			//
			// 		if(approval.code !== 200)
			// 		{
			// 			return resolve(null, approval.message || 'Approve failed.', approval.code || 500);
			// 		}
			// 	}
			// }

			/* ===== Run the script on the server ===== */
			const result = await scripts.Fn('item.run', script, server);

			resolve(result);
		}
		catch(error)
		{
			resolve(null, error.message, 500);
		}
	}
});
