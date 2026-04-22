import commands from '@onetype/framework/commands';
import packages from '#shared/packages/addon.js';

commands.Item({
	id: 'packages:create',
	exposed: true,
	method: 'POST',
	endpoint: '/api/packages',
	in: 'package --skip=id --skip=team_id --skip=status --skip=updated_at --skip=created_at --skip=deleted_at',
	out: 'package',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const item = packages.Item({
			...properties,
			team_id: this.http.state.user.team.id
		});

		await item.Create();

		resolve(item.GetData());
	}
});
