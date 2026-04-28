import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import servers from '#shared/servers/addon.js';

commands.Item({
	id: 'agents:bash',
	exposed: true,
	method: 'POST',
	endpoint: '/api/agents/bash',
	in: {
		server:     ['string'],
		bash:       ['string', null, true],
		passphrase: ['string', ''],
		terminal:   ['boolean', true]
	},
	out: {
		results: { type: 'array', value: [], each: ['object'] }
	},
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const query = servers.Find()
			.filter('team_id', this.http.state.user.team.id)
			.filter('is_connected', true)
			.filter('deleted_at', null, 'NULL');

		if(properties.server)
		{
			query.filter('id', properties.server);
		}

		const list = await query.limit(1000).many();

		if(list.length === 0)
		{
			return resolve(null, properties.server ? 'Server not found.' : 'No active servers.', 404);
		}

		const state = this.http.state;

		const runs = list.map(async (entry) =>
		{
			const result = await onetype.PipelineRun('agents:bash', {
				agent_id:   entry.Get('id'),
				bash:       properties.bash,
				passphrase: properties.passphrase,
				terminal:   properties.terminal
			}, { state });

			return {
				server:  String(entry.Get('id')),
				name:    entry.Get('name'),
				code:    result.code === 200 ? result.data.code : result.code,
				stdout:  result.code === 200 ? result.data.stdout : '',
				stderr:  result.code === 200 ? result.data.stderr : '',
				hash:    result.code === 401 && result.data ? result.data.hash : '',
				message: result.message
			};
		});

		const settled = await Promise.allSettled(runs);

		const results = settled.map((entry, index) =>
		{
			if(entry.status === 'fulfilled')
			{
				return entry.value;
			}

			const server = list[index];

			return {
				server:  String(server.Get('id')),
				name:    server.Get('name'),
				code:    500,
				stdout:  '',
				stderr:  '',
				hash:    '',
				message: entry.reason && entry.reason.message ? entry.reason.message : 'Internal error.'
			};
		});

		resolve({ results });
	}
});
