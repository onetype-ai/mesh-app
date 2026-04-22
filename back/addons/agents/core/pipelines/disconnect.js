import onetype from '@onetype/framework';
import agents from '#agents/addon.js';

onetype.Pipeline('agents:disconnect', {
	description: 'Tear down an agent registration. Closes the stream by default; pass end=false when called from the stream close handler itself.',
	in: {
		agent_id: ['string', null, true],
		end: ['boolean', true]
	}
})

.Join('agent', 10, {
	description: 'Load the live agent by id.',
	out: {
		agent: ['object']
	},
	callback: async ({ agent_id }, resolve) =>
	{
		const agent = agents.ItemGet(agent_id);

		if(!agent)
		{
			return resolve(null, 'Agent not connected.', 404);
		}

		return { agent };
	}
})

.Join('status', 20, {
	description: 'Mark the server disconnected. Leaves status and has_passphrase as they were — those describe lifecycle / last-known config, not live presence.',
	requires: ['agent'],
	callback: async ({ agent }) =>
	{
		const server = await agent.Get('server')();

		server.Set('is_connected', false);
		await server.Update({ whitelist: ['is_connected'] });
	}
})

.Join('close', 30, {
	description: 'Close the gRPC stream if requested.',
	requires: ['agent'],
	when: ({ end }) => end === true,
	callback: async ({ agent }) =>
	{
		const stream = agent.Get('stream')();

		if(stream)
		{
			stream.end();
		}
	}
})

.Join('remove', 40, {
	description: 'Remove the agent item from memory.',
	requires: ['agent'],
	callback: async ({ agent }) =>
	{
		agent.Remove();
	}
});
