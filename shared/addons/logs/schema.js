import onetype from '@onetype/framework';

onetype.DataSchema('log', {
	id: ['string'],
	team_id: ['string'],
	server_id: ['string'],
	script_id: ['string'],
	user_id: ['string'],
	level:
	{
		type: 'string',
		value: 'Info',
		required: true,
		options: ['Info', 'Warn', 'Error']
	},
	source:
	{
		type: 'string',
		value: 'System',
		required: true,
		options: ['Agent', 'Script', 'System']
	},
	code: ['number'],
	time: ['number'],
	output: ['object', {}],
	updated_at: ['string'],
	created_at: ['string'],
	deleted_at: ['string']
});
