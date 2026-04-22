import commands from '@onetype/framework/commands';

commands.Item({
	id: 'terminal:lines',
	in: {
		server: ['string'],
		last:   ['number', 0],
		limit:  ['number', 200]
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('terminal:lines', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		resolve(data);
	}
});
