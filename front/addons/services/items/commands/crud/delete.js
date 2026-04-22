import commands from '@onetype/framework/commands';

commands.Item({
	id: 'services:delete',
	in: {
		id: ['string', null, true],
		redirect: {
			type: 'string',
			options: ['services', 'creator']
		}
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('services:delete', { id: properties.id }, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Service deleted.', type: 'success' });

		if(properties.redirect === 'creator')
		{
			$ot.page('/creator/services');
		}
		else if(properties.redirect === 'services')
		{
			$ot.page('/services');
		}

		resolve(data);
	}
});
