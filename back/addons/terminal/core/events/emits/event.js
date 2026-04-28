import onetype from '@onetype/framework';
import agents from '#agents/addon.js';
import terminal from '#terminal/addon.js';

const LIMIT = 1000;

/*
Captures every agent.terminal event from the gRPC stream and turns it
into a terminal item. Two flavors arrive over the wire:

  Line event (during exec):
    { command_id, stream: stdout|stderr, sequence, output, time }

  End event (after exec):
    { command_id, end: true, code, time }

Both are stored as items so the front-end can replay full history,
filter by command_id, and tell finished commands from in-flight ones.
*/
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

	const data       = payload.data || {};
	const command_id = typeof data.command_id === 'string' ? data.command_id : '';
	const time       = typeof data.time === 'string' ? data.time : new Date().toISOString();
	const isEnd      = data.end === true;

	terminal.Item({
		server:      String(server),
		server_name: record.Get('name') || '',
		command_id,
		stream:      isEnd ? '' : (typeof data.stream === 'string' ? data.stream : 'stdout'),
		sequence:    typeof data.sequence === 'number' ? data.sequence : 0,
		output:      isEnd ? '' : (typeof data.output === 'string' ? data.output : ''),
		time,
		end:         isEnd,
		code:        isEnd && typeof data.code === 'number' ? data.code : 0
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
