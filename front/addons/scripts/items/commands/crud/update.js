import commands from '@onetype/framework/commands';

commands.Item({
	id: 'scripts:update',
	in: 'script --optional --skip=team_id --skip=hash --skip=status --skip=is_verified --skip=updated_at --skip=created_at --skip=deleted_at',
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('scripts:update', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Script updated.', type: 'success' });

		resolve(data);
	}
});
