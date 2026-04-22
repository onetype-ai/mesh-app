import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:packages:uninstall',
	in: {
		server_id: ['string', null, true],
		package_id: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('servers:packages:uninstall', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Package uninstalled.', type: 'success' });

		$ot.page('/servers/' + properties.server_id + '/packages');

		resolve(data);
	}
});
