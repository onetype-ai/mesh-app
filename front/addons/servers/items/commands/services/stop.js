import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:services:stop',
	in: {
		server_id: ['string', null, true],
		service_id: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('servers:services:stop', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Service stopped.', type: 'success' });

		resolve(data);
	}
});
