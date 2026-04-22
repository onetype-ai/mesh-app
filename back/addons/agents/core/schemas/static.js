import onetype from '@onetype/framework';

onetype.DataSchema('system.static', {
	os:
	{
		type: 'object',
		config:
		{
			name: ['string', '', true],
			version: ['string', '', true],
			kernel: ['string', '', true]
		}
	},
	arch: ['string', '', true],
	cpu:
	{
		type: 'object',
		config:
		{
			model: ['string', '', true],
			cores: ['number', 0, true],
			threads: ['number', 0, true]
		}
	},
	ram:
	{
		type: 'object',
		config:
		{
			total: ['number', 0, true]
		}
	},
	disk:
	{
		type: 'array',
		value: [],
		each:
		{
			type: 'object',
			config:
			{
				device: ['string', '', true],
				total: ['number', 0, true]
			}
		}
	},
	gpu:
	{
		type: 'array',
		value: [],
		each:
		{
			type: 'object',
			config:
			{
				model: ['string', '', true],
				vram: ['number', 0, true],
				driver: ['string', '', true]
			}
		}
	},
	network:
	{
		type: 'object',
		config:
		{
			hostname: ['string', '', true],
			mac: ['string', '', true]
		}
	}
});
