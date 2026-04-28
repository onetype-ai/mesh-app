import onetype from '@onetype/framework';
import agents from '#agents/addon.js';

onetype.Pipeline('agents:bash', {
	description: 'Execute a bash command on a connected agent.',
	timeout: 1800000,
	in: {
		agent_id:   ['string', null, true],
		bash:       ['string', null, true],
		passphrase: ['string', ''],
		terminal:   ['boolean', true],
		timeout:    ['number', 120000],
		command_id: ['string', '']
	},
	out: {
		stdout: ['string', ''],
		stderr: ['string', ''],
		code:   ['number', 0]
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

.Join('execute', 20, {
	description: 'Run the bash command through the agent gRPC stream.',
	requires: ['agent'],
	callback: async ({ agent, bash, passphrase, terminal, timeout, command_id }, resolve) =>
	{
		const response = await agent.Get('bash')(bash, passphrase, command_id || null, terminal, timeout);

		if(response.code !== 200)
		{
			return resolve(response.data || null, response.message, response.code);
		}

		const data = onetype.DataDefine(response.data, {
			stdout: ['string', ''],
			stderr: ['string', ''],
			code:   ['number', 0, true]
		}, true);

		return {
			stdout: data.stdout,
			stderr: data.stderr,
			code:   data.code
		};
	}
});
