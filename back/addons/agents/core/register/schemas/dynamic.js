import onetype from '@onetype/framework';

onetype.DataSchema('system.dynamic', {
	cpu:
	{
		type: 'object',
		config:
		{
			usage: ['number', 0, true],
			load_1: ['number', 0, true],
			load_5: ['number', 0, true],
			load_15: ['number', 0, true]
		}
	},
	ram:
	{
		type: 'object',
		config:
		{
			used: ['number', 0, true],
			free: ['number', 0, true]
		}
	},
	uptime: ['number', 0, true],
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
				used: ['number', 0, true],
				free: ['number', 0, true]
			}
		}
	},
	network:
	{
		type: 'array',
		value: [],
		each:
		{
			type: 'object',
			config:
			{
				interface: ['string', '', true],
				rx_bytes: ['number', 0, true],
				tx_bytes: ['number', 0, true],
				rx_per_sec: ['number', 0, true],
				tx_per_sec: ['number', 0, true]
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
				usage: ['number', 0, true],
				vram_used: ['number', 0, true],
				temp: ['number', 0, true]
			}
		}
	}
});
