import commands from '@onetype/framework/commands';

commands.Item({
	id: 'packages:update',
	in: 'package --optional --skip=team_id --skip=status --skip=is_verified --skip=updated_at --skip=created_at --skip=deleted_at',
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('packages:update', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Package updated.', type: 'success' });

		resolve(data);
	}
});
