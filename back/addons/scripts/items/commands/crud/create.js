import commands from '@onetype/framework/commands';
import scripts from '#shared/scripts/addon.js';

commands.Item({
	id: 'scripts:create',
	exposed: true,
	method: 'POST',
	endpoint: '/api/scripts',
	in: 'script --skip=id --skip=team_id --skip=hash --skip=status --skip=updated_at --skip=created_at --skip=deleted_at',
	out: 'script',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const item = scripts.Item({
			...properties,
			team_id: this.http.state.user.team.id
		});

		await item.Create();

		resolve(item.GetData());
	}
});
