import commands from '@onetype/framework/commands';
import servers from '#shared/servers/addon.js';

commands.Item({
	id: 'servers:one',
	exposed: true,
	method: 'GET',
	endpoint: '/api/servers/:id',
	in: {
		id: ['string', null, true]
	},
	out: 'server',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const item = await servers.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.one();

		if(!item)
		{
			return resolve(null, 'Server not found.', 404);
		}

		resolve(item.GetData());
	}
});
