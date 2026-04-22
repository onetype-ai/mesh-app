import commands from '@onetype/framework/commands';

commands.Item({
	id: 'packages:delete',
	in: {
		id: ['string', null, true],
		redirect: {
			type: 'string',
			options: ['packages', 'creator']
		}
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('packages:delete', { id: properties.id }, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Package deleted.', type: 'success' });

		if(properties.redirect === 'creator')
		{
			$ot.page('/creator/packages');
		}
		else if(properties.redirect === 'packages')
		{
			$ot.page('/packages');
		}

		resolve(data);
	}
});
