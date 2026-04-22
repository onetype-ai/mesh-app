import onetype from '@onetype/framework';

onetype.DataSchema('gateway', {
	id: ['string'],
	name: ['string', null, true],
	host: ['string', null, true],
	port: ['number', 50000],
	status:
	{
		type: 'string',
		value: 'Active',
		required: true,
		options: ['Draft', 'Active', 'Inactive']
	},
	updated_at: ['string'],
	created_at: ['string'],
	deleted_at: ['string']
});
