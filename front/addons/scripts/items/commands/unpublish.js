import commands from '@onetype/framework/commands';

commands.Item({
	id: 'scripts:unpublish',
	in: {
		id: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('scripts:unpublish', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Script unpublished.', type: 'success' });

		resolve(data);
	}
});
