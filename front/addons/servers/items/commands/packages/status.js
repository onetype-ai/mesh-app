import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:packages:status',
	in: {
		server_id: ['string', null, true],
		package_id: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('servers:packages:status', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Status refreshed.', type: 'success' });

		resolve(data);
	}
});
