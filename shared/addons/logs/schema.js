import onetype from '@onetype/framework';

onetype.DataSchema('log', {
	id: ['string'],
	team_id: ['string'],
	user: ['object'],
	actor_ip: ['string'],
	actor_agent: ['string'],
	correlation_id: ['string'],
	action: ['string', null, true],
	level:
	{
		type: 'string',
		value: 'Info',
		required: true,
		options: ['Info', 'Warn', 'Error']
	},
	target_type:
	{
		type: 'string',
		options: ['Server', 'Script', 'Package', 'Service']
	},
	target_id: ['string'],
	reference_type:
	{
		type: 'string',
		options: ['Server', 'Script', 'Package', 'Service']
	},
	reference_id: ['string'],
	code: ['number'],
	time: ['number'],
	output: ['object', {}],
	hash: ['string'],
	hit_count: ['number', 1],
	updated_at: ['string'],
	created_at: ['string'],
	deleted_at: ['string']
});
