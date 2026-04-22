import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:packages:install',
	in: {
		server_id: ['string', null, true],
		package_id: ['string', null, true]
	},
	out: 'package',
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('servers:packages:install', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Package installed.', type: 'success' });

		$ot.page('/servers/' + properties.server_id + '/packages/' + data.id);

		resolve(data);
	}
});
