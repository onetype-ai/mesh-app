import commands from '@onetype/framework/commands';

commands.Item({
	id: 'scripts:create',
	in: {
		data: {
			type: 'object',
			config: 'script --skip=id --skip=team_id --skip=hash --skip=status --skip=updated_at --skip=created_at --skip=deleted_at'
		},
		redirect: {
			type: 'string',
			options: ['scripts', 'creator']
		}
	},
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('scripts:create', properties.data, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Script created.', type: 'success' });

		if(properties.redirect === 'creator')
		{
			$ot.page('/creator/scripts/' + data.id);
		}
		else if(properties.redirect === 'scripts')
		{
			$ot.page('/scripts/' + data.id);
		}

		resolve(data);
	}
});
