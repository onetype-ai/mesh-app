import commands from '@onetype/framework/commands';

commands.Item({
	id: 'marketplace:service:import',
	in: {
		service_id: ['string', null, true]
	},
	out: 'service',
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('marketplace:service:import', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Service imported.', type: 'success' });

		resolve(data);
	}
});
