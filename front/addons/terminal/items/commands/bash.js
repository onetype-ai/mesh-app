import commands from '@onetype/framework/commands';

commands.Item({
	id: 'agents:bash',
	in: {
		server:     ['string'],
		bash:       ['string', null, true],
		passphrase: ['string', ''],
		terminal:   ['boolean', true]
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('agents:bash', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		resolve(data);
	}
});
