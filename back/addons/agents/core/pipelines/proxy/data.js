import onetype from '@onetype/framework';
import agents from '#agents/addon.js';

onetype.Pipeline('agents:proxy.data', {
	description: 'Forward raw bytes through an open tunnel. Fire-and-forget — no response is awaited from the agent.',
	timeout: 5000,
	in: {
		agent_id:  ['string', null, true],
		tunnel_id: ['string', null, true],
		payload:   ['object', null, true]
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

.Join('send', 20, {
	description: 'Emit agent.proxy.data event with the payload buffer.',
	requires: ['agent'],
	callback: async ({ agent, tunnel_id, payload }) =>
	{
		agent.Get('proxy_data')(tunnel_id, payload);
	}
});
