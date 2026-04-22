import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:delete',
	in: {
		id: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('servers:delete', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Server deleted.', type: 'success' });
		$ot.page('/servers');

		resolve(data);
	}
});
