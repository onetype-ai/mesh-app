import commands from '@onetype/framework/commands';
import servers from '#shared/servers/addon.js';
import terminal from '#terminal/addon.js';

commands.Item({
	id: 'terminal:lines',
	exposed: true,
	method: 'GET',
	endpoint: '/api/terminal/lines',
	in: {
		server: ['string'],
		last:   ['number', 0],
		limit:  ['number', 200]
	},
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const teamServers = await servers.Find()
			.filter('team_id', this.http.state.user.team.id)
			.filter('deleted_at', null, 'NULL')
			.select(['id'])
			.limit(10000)
			.many();

		const allowed = new Set(teamServers.map((server) => String(server.Get('id'))));

		if(properties.server && !allowed.has(String(properties.server)))
		{
			return resolve(null, 'Server not found.', 404);
		}

		const all   = Object.values(terminal.Items());
		const last  = typeof properties.last  === 'number' ? properties.last  : 0;
		const limit = typeof properties.limit === 'number' ? properties.limit : 200;

		let list = all.filter((item) =>
		{
			if(item.Get('id') <= last)
			{
				return false;
			}

			if(properties.server && item.Get('server') !== String(properties.server))
			{
				return false;
			}

			return allowed.has(item.Get('server'));
		});

		list.sort((a, b) => a.Get('id') - b.Get('id'));

		if(list.length > limit)
		{
			list = list.slice(list.length - limit);
		}

		const items  = list.map((item) => item.GetData());
		const cursor = items.length > 0 ? items[items.length - 1].id : last;

		resolve({
			items,
			cursor
		});
	}
});
