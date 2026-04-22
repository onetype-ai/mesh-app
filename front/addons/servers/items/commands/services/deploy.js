import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:services:deploy',
	in: {
		server_id: ['string', null, true],
		service_id: ['string', null, true]
	},
	out: 'service',
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('servers:services:deploy', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Service deployed.', type: 'success' });

		$ot.page('/servers/' + properties.server_id + '/services/' + data.id);

		resolve(data);
	}
});
