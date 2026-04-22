import onetype from '@onetype/framework';
import terminal from '#terminal/addon.js';

onetype.EmitOn('agents.grpc.disconnect', ({ stream }) =>
{
	const server = stream.agent_id;

	if(!server)
	{
		return;
	}

	const all  = Object.values(terminal.Items());
	const mine = all.filter((item) => item.Get('server') === String(server));

	for(const item of mine)
	{
		terminal.ItemRemove(item.Get('id'));
	}
});
