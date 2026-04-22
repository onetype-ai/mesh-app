import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import servers from '#shared/servers/addon.js';
import agents from '#agents/addon.js';

commands.Item({
	id: 'servers:delete',
	exposed: true,
	method: 'DELETE',
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

		if(agents.ItemGet(item.Get('id')))
		{
			await onetype.PipelineRun('agents:disconnect', { agent_id: item.Get('id') });
		}

		item.Set('deleted_at', new Date().toISOString());
		await item.Update();

		const data = item.GetData();

		delete data.token;

		resolve(data);
	}
});
