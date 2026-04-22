import crypto from 'crypto';
import commands from '@onetype/framework/commands';
import servers from '#shared/servers/addon.js';

commands.Item({
	id: 'servers:token',
	exposed: true,
	method: 'POST',
	endpoint: '/api/servers/:id/token',
	in: {
		id: ['string', null, true]
	},
	out: {
		token: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const server = await servers.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!server)
		{
			return resolve(null, 'Server not found.', 404);
		}

		const token = crypto.randomBytes(96).toString('hex');

		server.Set('token', token);
		await server.Update({ whitelist: ['token'] });

		resolve({ token });
	}
});
