import onetype from '@onetype/framework';

const logs = onetype.Addon('logs', (logs) =>
{
	logs.Field('id', ['string']);
	logs.Field('team_id', ['string', null, true]);
	logs.Field('server_id', ['string']);
	logs.Field('script_id', ['string']);
	logs.Field('user_id', ['string']);

	logs.Field('level',
	{
		type: 'string',
		value: 'Info',
		required: true,
		options: ['Info', 'Warn', 'Error']
	});

	logs.Field('source',
	{
		type: 'string',
		value: 'System',
		required: true,
		options: ['Agent', 'Script', 'System']
	});

	logs.Field('code', ['number']);
	logs.Field('time', ['number']);
	logs.Field('output', ['object', {}]);

	logs.Field('updated_at', ['string']);
	logs.Field('created_at', ['string']);
	logs.Field('deleted_at', ['string']);
});

export default logs;
