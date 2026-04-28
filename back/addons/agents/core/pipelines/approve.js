import onetype from '@onetype/framework';
import agents from '#agents/addon.js';

onetype.Pipeline('agents:approve', {
	description: 'Add hashes to the agent allowlist after passphrase verification.',
	timeout: 30000,
	in: {
		agent_id:   ['string', null, true],
		hashes:     { type: 'array', value: [], each: ['string'], required: true },
		passphrase: ['string', null, true]
	},
	out: {
		count: ['number', 0]
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

.Join('approve', 20, {
	description: 'Send agent.approve through the gRPC stream.',
	requires: ['agent'],
	out: {
		count: ['number', 0]
	},
	callback: async ({ agent, hashes, passphrase }, resolve) =>
	{
		const response = await agent.Get('approve')(hashes, passphrase);

		if(response.code !== 200)
		{
			return resolve(null, response.message, response.code);
		}

		const data = onetype.DataDefine(response.data, {
			count: ['number', 0, true]
		}, true);

		return { count: data.count };
	}
});
