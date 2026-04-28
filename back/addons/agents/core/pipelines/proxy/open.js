import onetype from '@onetype/framework';
import agents from '#agents/addon.js';

onetype.Pipeline('agents:proxy.open', {
	description: 'Open a raw TCP tunnel from the gateway to a local socket on the agent host.',
	timeout: 10000,
	in: {
		agent_id:    ['string', null, true],
		tunnel_id:   ['string', null, true],
		target_host: ['string', null, true],
		target_port: ['number', null, true]
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

.Join('open', 20, {
	description: 'Send agent.proxy.open and wait for the dial result.',
	requires: ['agent'],
	callback: async ({ agent, tunnel_id, target_host, target_port }, resolve) =>
	{
		const response = await agent.Get('proxy_open')(tunnel_id, target_host, target_port);

		if(response.code !== 200)
		{
			return resolve(response.data || null, response.message, response.code);
		}
	}
});
