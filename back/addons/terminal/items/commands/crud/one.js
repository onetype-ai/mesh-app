import commands from '@onetype/framework/commands';
import servers from '#shared/servers/addon.js';
import terminal from '#terminal/addon.js';

commands.Item({
	id: 'terminal:line',
	exposed: true,
	method: 'GET',
	endpoint: '/api/terminal/lines/:id',
	in: {
		id: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const item = terminal.ItemGet(Number(properties.id));

		if(!item)
		{
			return resolve(null, 'Line not found.', 404);
		}

		const server = await servers.Find()
			.filter('id', item.Get('server'))
			.filter('team_id', this.http.state.user.team.id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!server)
		{
			return resolve(null, 'Line not found.', 404);
		}

		resolve(item.GetData());
	}
});
