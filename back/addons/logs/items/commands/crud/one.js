import commands from '@onetype/framework/commands';
import logs from '#shared/logs/addon.js';

commands.Item({
	id: 'logs:one',
	exposed: true,
	method: 'GET',
	endpoint: '/api/logs/:id',
	in: {
		id: ['string', null, true]
	},
	out: 'log',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const item = await logs.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.one();

		if(!item)
		{
			return resolve(null, 'Log not found.', 404);
		}

		resolve(item.GetData());
	}
});
