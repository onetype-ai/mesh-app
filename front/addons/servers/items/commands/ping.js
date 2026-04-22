import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:ping',
	in: {
		id: ['string', null, true]
	},
	out: {
		connected: ['boolean', false, true]
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('servers:ping', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		if(data.connected)
		{
			$ot.toast({ message: 'Agent connected and responding.', type: 'success' });
		}
		else
		{
			$ot.toast({ message: 'Agent did not respond.', type: 'error' });
		}

		resolve(data);
	}
});
