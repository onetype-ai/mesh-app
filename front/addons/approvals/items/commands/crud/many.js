import commands from '@onetype/framework/commands';

commands.Item({
	id: 'approvals:many',
	in: 'query',
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('approvals:many', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		resolve(data);
	}
});
