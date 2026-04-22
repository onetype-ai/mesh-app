import commands from '@onetype/framework/commands';

commands.Item({
	id: 'services:unpublish',
	in: {
		id: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('services:unpublish', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Service unpublished.', type: 'success' });

		resolve(data);
	}
});
