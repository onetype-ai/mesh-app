import commands from '@onetype/framework/commands';

commands.Item({
	id: 'scripts:delete',
	in: {
		id: ['string', null, true],
		redirect: {
			type: 'string',
			options: ['scripts', 'creator']
		}
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('scripts:delete', { id: properties.id }, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Script deleted.', type: 'success' });

		if(properties.redirect === 'creator')
		{
			$ot.page('/creator/scripts');
		}
		else if(properties.redirect === 'scripts')
		{
			$ot.page('/scripts');
		}

		resolve(data);
	}
});
