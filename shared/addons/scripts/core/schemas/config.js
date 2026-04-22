import onetype from '@onetype/framework';

/* ===== Config schema ===== */

/*
	Used inside script.config to declare configurable parameters the user
	can set when installing/deploying.

	Each entry is a standard framework DataDefine config — the exact same
	shape used for addon fields, command in/out, pipeline in/out. This is
	intentional: one config format across the platform, AI-friendly.

	Example:
		config: {
			port: {
				type: 'number',
				value: 8000,
				description: 'HTTP port the service listens on.'
			},
			model: {
				type: 'string',
				required: true,
				options: ['llama-3.1-70b', 'mistral-7b'],
				description: 'Model to serve.'
			},
			gpu_memory: {
				type: 'number',
				value: 0.9,
				description: 'Fraction of GPU memory to use (0-1).'
			}
		}

	Later the user fills in values like:
		{ port: 8000, model: 'llama-3.1-70b', gpu_memory: 0.9 }

	Validated against this schema via onetype.DataDefine(userValues, scriptConfig, true).
*/

onetype.DataSchema('config', {
	type:
	{
		type: 'string',
		required: true,
		options: ['string', 'number', 'boolean', 'object', 'array', 'any'],
		description: 'Underlying JS type.'
	},
	value:
	{
		type: 'any',
		description: 'Default value.'
	},
	required:
	{
		type: 'boolean',
		value: false,
		description: 'Whether the user must provide a value.'
	},
	label:
	{
		type: 'string',
		value: '',
		description: 'Human-readable label shown in UI forms.'
	},
	description:
	{
		type: 'string',
		value: '',
		description: 'Help text shown under the field.'
	},
	options:
	{
		type: 'array',
		value: [],
		each: { type: 'string|number|boolean' },
		description: 'Allowed values — turns the field into a dropdown.'
	},
	placeholder:
	{
		type: 'string',
		value: '',
		description: 'Placeholder text for input fields.'
	},
	secret:
	{
		type: 'boolean',
		value: false,
		description: 'Mask input, store encrypted. Use for tokens, passwords, API keys.'
	}
});
