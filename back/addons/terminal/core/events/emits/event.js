import onetype from '@onetype/framework';
import agents from '#agents/addon.js';
import terminal from '#terminal/addon.js';

const LIMIT = 1000;

onetype.EmitOn('agents.grpc.event', async ({ stream, payload, name }) =>
{
	if(name !== 'agent.terminal')
	{
		return;
	}

	const server = stream.agent_id;

	if(!server)
	{
		return;
	}

	const agent = agents.ItemGet(server);

	if(!agent)
	{
		return;
	}

	const record = await agent.Get('server')();

	if(!record)
	{
		return;
	}

	const data   = payload.data || {};
	const output = typeof data.output === 'string' ? data.output : '';
	const time   = typeof data.time   === 'string' ? data.time   : new Date().toISOString();

	terminal.Item({
		server:      String(server),
		server_name: record.Get('name') || '',
		output,
		time
	});

	const all    = Object.values(terminal.Items());
	const mine   = all.filter((item) => item.Get('server') === String(server));
	const excess = mine.length - LIMIT;

	if(excess > 0)
	{
		mine.sort((a, b) => a.Get('id') - b.Get('id'));

		for(let i = 0; i < excess; i++)
		{
			terminal.ItemRemove(mine[i].Get('id'));
		}
	}
});
