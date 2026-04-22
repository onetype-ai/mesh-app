import commands from '@onetype/framework/commands';

commands.Item({
	id: 'services:update',
	in: 'service --optional --skip=team_id --skip=status --skip=is_verified --skip=updated_at --skip=created_at --skip=deleted_at',
	callback: async function(properties, resolve)
	{
		const { data, code, message } = await $ot.command('services:update', properties, true);

		if(code !== 200)
		{
			$ot.toast({ message, type: 'error' });
			return resolve(null, message, code);
		}

		$ot.toast({ message: 'Service updated.', type: 'success' });

		resolve(data);
	}
});
