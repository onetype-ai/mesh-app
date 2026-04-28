import onetype from '@onetype/framework';
import agents from '#agents/addon.js';

onetype.Pipeline('agents:proxy.close', {
	description: 'Close an open tunnel. Fire-and-forget — agent acknowledges by tearing down the local TCP socket.',
	timeout: 5000,
	in: {
		agent_id:  ['string', null, true],
		tunnel_id: ['string', null, true]
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
	description: 'Emit agent.proxy.close event.',
	requires: ['agent'],
	callback: async ({ agent, tunnel_id }) =>
	{
		agent.Get('proxy_close')(tunnel_id);
	}
});
