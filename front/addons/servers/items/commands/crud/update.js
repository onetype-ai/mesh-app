import commands from '@onetype/framework/commands';

commands.Item({
	id: 'servers:update',
	in: 'server --optional --pick=id --pick=name --pick=system_refresh',
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('servers:update', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Server updated.', type: 'success' });

		resolve(data);
	}
});
