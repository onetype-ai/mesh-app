import commands from '@onetype/framework/commands';

commands.Item({
	id: 'packages:create',
	in: {
		data: {
			type: 'object',
			config: 'package --skip=id --skip=team_id --skip=status --skip=updated_at --skip=created_at --skip=deleted_at'
		},
		redirect: {
			type: 'string',
			options: ['packages', 'creator']
		}
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('packages:create', properties.data, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Package created.', type: 'success' });

		if(properties.redirect === 'creator')
		{
			$ot.page('/creator/packages/' + data.id);
		}
		else if(properties.redirect === 'packages')
		{
			$ot.page('/packages/' + data.id);
		}

		resolve(data);
	}
});
