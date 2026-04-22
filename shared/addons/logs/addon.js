import onetype from '@onetype/framework';

const logs = onetype.Addon('logs', (logs) =>
{
	logs.Field('id', ['string']);
	logs.Field('team_id', ['string', null, true]);
	logs.Field('user', ['object']);
	logs.Field('actor_ip', ['string']);
	logs.Field('actor_agent', ['string']);
	logs.Field('correlation_id', ['string']);

	logs.Field('action', ['string', null, true]);

	logs.Field('level',
	{
		type: 'string',
		value: 'Info',
		required: true,
		options: ['Info', 'Warn', 'Error']
	});

	logs.Field('target_type',
	{
		type: 'string',
		options: ['Server', 'Script', 'Package', 'Service']
	});
	logs.Field('target_id', ['string']);

	logs.Field('reference_type',
	{
		type: 'string',
		options: ['Server', 'Script', 'Package', 'Service']
	});
	logs.Field('reference_id', ['string']);

	logs.Field('code', ['number']);
	logs.Field('time', ['number']);
	logs.Field('output', ['object', {}]);

	logs.Field('hash', ['string']);
	logs.Field('hit_count', ['number', 1]);

	logs.Field('updated_at', ['string']);
	logs.Field('created_at', ['string']);
	logs.Field('deleted_at', ['string']);
});

import './schema.js';

export default logs;
