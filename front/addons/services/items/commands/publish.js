import commands from '@onetype/framework/commands';

commands.Item({
	id: 'services:publish',
	in: {
		id: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('services:publish', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Service published.', type: 'success' });

		resolve(data);
	}
});
