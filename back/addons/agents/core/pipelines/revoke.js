import onetype from '@onetype/framework';
import agents from '#agents/addon.js';

onetype.Pipeline('agents:revoke', {
	description: 'Remove approved hashes from the agent allowlist after passphrase verification.',
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

.Join('revoke', 20, {
	description: 'Send agent.revoke through the gRPC stream.',
	requires: ['agent'],
	out: {
		count: ['number', 0]
	},
	callback: async ({ agent, hashes, passphrase }, resolve) =>
	{
		const response = await agent.Get('revoke')(hashes, passphrase);

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
