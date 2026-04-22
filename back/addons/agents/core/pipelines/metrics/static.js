import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import onetype from '@onetype/framework';
import agents from '#agents/addon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const script = fs.readFileSync(path.join(__dirname, '../../../files/bash/static.txt'), 'utf8');

onetype.Pipeline('agents:metrics.static', {
	description: 'Poll static system information (os/arch/cpu/ram/disk/gpu/network) and store it on the server.',
	timeout: 30000,
	in: {
		agent_id: ['string', null, true]
	},
	out: {
		system: { type: 'object', config: 'system.static', required: true }
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

.Join('bash', 20, {
	description: 'Execute the static metrics script via the bash pipeline.',
	requires: ['agent'],
	out: {
		stdout: ['string']
	},
	callback: async function({ agent_id })
	{
		const { stdout } = await this.Pipeline('agents:bash', {
			agent_id,
			bash: script,
			terminal: false
		});

		return { stdout };
	}
})

.Join('parse', 30, {
	description: 'Parse JSON and validate shape strictly.',
	requires: ['stdout'],
	out: {
		system: { type: 'object', config: 'system.static' }
	},
	callback: async ({ stdout }, resolve) =>
	{
		let raw;

		try
		{
			raw = JSON.parse(stdout);
		}
		catch(error)
		{
			return resolve(null, 'Agent returned invalid JSON: ' + error.message, 502);
		}

		const system = onetype.DataDefine(raw, 'system.static', true);

		return { system };
	}
})

.Join('save', 40, {
	description: 'Persist static info on the server.',
	requires: ['agent', 'system'],
	callback: async ({ agent, system }) =>
	{
		const server = await agent.Get('server')();

		server.Set('system_static', system);
		await server.Update({ whitelist: ['system_static'] });
	}
});
