import commands from '@onetype/framework/commands';
import servers from '#shared/servers/addon.js';

commands.Item({
	id: 'servers:create',
	exposed: true,
	method: 'POST',
	endpoint: '/api/servers/create',
	in: {
		name: ['string', null, true],
		scripts: { type: 'array', value: [], each: ['string'] }
	},
	out: {
		id: ['string', null, true],
		token: ['string', null, true]
	},
	callback: async function(properties, resolve)
	{
		const server = await servers.Fn('create', properties.name, properties.scripts);

		resolve({
			id: server.Get('id'),
			token: server.Get('token')
		});
	}
});
