import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:scripts:detach',
	in: {
		server_id: ['string', null, true],
		script_id: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('servers:scripts:detach', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Script detached.', type: 'success' });

		resolve(data);
	}
});
