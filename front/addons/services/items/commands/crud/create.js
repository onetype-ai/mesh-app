import commands from '@onetype/framework/commands';

commands.Item({
	id: 'services:create',
	in: {
		data: {
			type: 'object',
			config: 'service --skip=id --skip=team_id --skip=status --skip=updated_at --skip=created_at --skip=deleted_at'
		},
		redirect: {
			type: 'string',
			options: ['services', 'creator']
		}
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('services:create', properties.data, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Service created.', type: 'success' });

		if(properties.redirect === 'creator')
		{
			$ot.page('/creator/services/' + data.id);
		}
		else if(properties.redirect === 'services')
		{
			$ot.page('/services/' + data.id);
		}

		resolve(data);
	}
});
