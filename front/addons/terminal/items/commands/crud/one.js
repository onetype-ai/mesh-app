import commands from '@onetype/framework/commands';

commands.Item({
	id: 'terminal:line',
	in: {
		id: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('terminal:line', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		resolve(data);
	}
});
