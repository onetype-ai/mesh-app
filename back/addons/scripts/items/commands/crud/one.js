import commands from '@onetype/framework/commands';
import scripts from '#shared/scripts/addon.js';

commands.Item({
	id: 'scripts:one',
	exposed: true,
	method: 'GET',
	endpoint: '/api/scripts/:id',
	in: {
		id: ['string', null, true]
	},
	out: 'script',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const item = await scripts.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.one();

		if(!item)
		{
			return resolve(null, 'Script not found.', 404);
		}

		resolve(item.GetData());
	}
});
