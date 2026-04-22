import commands from '@onetype/framework/commands';

commands.Item({
	id: 'terminal:clear',
	in: {
		server: ['string']
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('terminal:clear', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		resolve(data);
	}
});
