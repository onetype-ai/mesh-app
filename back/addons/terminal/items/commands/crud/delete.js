import commands from '@onetype/framework/commands';
import servers from '#shared/servers/addon.js';
import terminal from '#terminal/addon.js';

commands.Item({
	id: 'terminal:clear',
	exposed: true,
	method: 'DELETE',
	endpoint: '/api/terminal/lines',
	in: {
		server: ['string']
	},
	out: {
		removed: ['number', 0]
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

		const allowed = new Set(teamServers.map((entry) => String(entry.Get('id'))));

		if(properties.server && !allowed.has(String(properties.server)))
		{
			return resolve(null, 'Server not found.', 404);
		}

		const all    = Object.values(terminal.Items());
		const victim = all.filter((item) =>
		{
			if(properties.server)
			{
				return item.Get('server') === String(properties.server);
			}

			return allowed.has(item.Get('server'));
		});

		for(const item of victim)
		{
			terminal.ItemRemove(item.Get('id'));
		}

		resolve({ removed: victim.length });
	}
});
