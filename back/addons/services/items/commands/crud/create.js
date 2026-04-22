import commands from '@onetype/framework/commands';
import services from '#shared/services/addon.js';

commands.Item({
	id: 'services:create',
	exposed: true,
	method: 'POST',
	endpoint: '/api/services',
	in: 'service --skip=id --skip=team_id --skip=status --skip=updated_at --skip=created_at --skip=deleted_at',
	out: 'service',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const item = services.Item({
			...properties,
			team_id: this.http.state.user.team.id
		});

		await item.Create();

		resolve(item.GetData());
	}
});
