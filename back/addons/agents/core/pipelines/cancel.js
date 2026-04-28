import onetype from '@onetype/framework';
import agents from '#agents/addon.js';

onetype.Pipeline('agents:cancel', {
	description: 'Kill an in-flight bash command on a connected agent.',
	timeout: 10000,
	in: {
		agent_id:   ['string', null, true],
		command_id: ['string', null, true]
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

.Join('cancel', 20, {
	description: 'Send agent.cancel through the gRPC stream.',
	requires: ['agent'],
	callback: async ({ agent, command_id }, resolve) =>
	{
		const response = await agent.Get('cancel')(command_id);

		if(response.code !== 200)
		{
			return resolve(null, response.message, response.code);
		}
	}
});
