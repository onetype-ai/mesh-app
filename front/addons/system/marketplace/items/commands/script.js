import commands from '@onetype/framework/commands';

commands.Item({
	id: 'marketplace:script:import',
	in: {
		script_id: ['string', null, true]
	},
	out: 'script',
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('marketplace:script:import', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Script imported.', type: 'success' });

		resolve(data);
	}
});
