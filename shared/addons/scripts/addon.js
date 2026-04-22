import onetype from '@onetype/framework';

const scripts = onetype.Addon('scripts', (scripts) =>
{
	scripts.Table('mesh_scripts');

	scripts.Field('id', ['string']);
	scripts.Field('team_id', ['string', null, true]);
	scripts.Field('service_id', ['string']);
	scripts.Field('server_id', ['string']);
	scripts.Field('package_id', ['string']);
	scripts.Field('name', ['string']);
	scripts.Field('slug', ['string']);
	scripts.Field('description', ['string']);

	scripts.Field('status',
	{
		type: 'string',
		value: 'Draft',
		required: true,
		options: ['Draft', 'Published']
	});

	scripts.Field('platforms',
	{
		type: 'array',
		value: ['*'],
		each:
		{
			type: 'string',
			options: ['*', 'Linux', 'Darwin']
		}
	});

	scripts.Field('is_marketplace', ['boolean', false]);
	scripts.Field('is_verified', ['boolean', false]);
	scripts.Field('autorun', ['boolean', false]);
	scripts.Field('loop', ['number']);

	scripts.Field('output',
	{
		type: 'string',
		value: 'Raw',
		options: ['Raw', 'JSON']
	});

	scripts.Field('bash', ['string', null, true]);
	scripts.Field('hash', ['string']);
	scripts.Field('config', ['object', {}]);

	scripts.Field('updated_at', ['string']);
	scripts.Field('created_at', ['string']);
	scripts.Field('deleted_at', ['string']);

	scripts.Field('metrics', ['object', {}]);
});

import './core/schemas/metrics.js';
import './core/schemas/config.js';
import './core/schemas/script.js';

export default scripts;
