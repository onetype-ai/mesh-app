import commands from '@onetype/framework/commands';

commands.Item({
	id: 'marketplace:package:import',
	in: {
		package_id: ['string', null, true]
	},
	out: 'package',
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('marketplace:package:import', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Package imported.', type: 'success' });

		resolve(data);
	}
});
