import onetype from '@onetype/framework';

const gateways = onetype.Addon('gateways', (gateways) =>
{
	gateways.Field('id', ['string']);
	gateways.Field('name', ['string', null, true]);
	gateways.Field('host', ['string', null, true]);
	gateways.Field('port', ['number', 50000]);

	gateways.Field('status',
	{
		type: 'string',
		value: 'Active',
		required: true,
		options: ['Draft', 'Active', 'Inactive']
	});

	gateways.Field('updated_at', ['string']);
	gateways.Field('created_at', ['string']);
	gateways.Field('deleted_at', ['string']);
});

import './schema.js';

export default gateways;
