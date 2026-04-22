import onetype from '@onetype/framework';

const services = onetype.Addon('services', (services) =>
{
	services.Field('id', ['string']);
	services.Field('team_id', ['string', null, true]);
	services.Field('server_id', ['string']);
	services.Field('name', ['string', null, true]);
	services.Field('slug', ['string']);
	services.Field('description', ['string']);
	services.Field('overview', ['string']);
	services.Field('version', ['string']);

	services.Field('script_requirements_id', ['string']);
	services.Field('script_deploy_id', ['string']);
	services.Field('script_start_id', ['string']);
	services.Field('script_stop_id', ['string']);
	services.Field('script_restart_id', ['string']);
	services.Field('script_destroy_id', ['string']);
	services.Field('script_status_id', ['string']);

	services.Field('config', ['object', {}]);
	services.Field('deployed_metric', ['string']);
	services.Field('running_metric', ['string']);

	services.Field('status',
	{
		type: 'string',
		value: 'Draft',
		required: true,
		options: ['Draft', 'Published']
	});

	services.Field('platforms',
	{
		type: 'array',
		value: ['*'],
		each:
		{
			type: 'string',
			options: ['*', 'Linux', 'Darwin']
		}
	});

	services.Field('is_marketplace', ['boolean', false]);
	services.Field('is_verified', ['boolean', false]);

	services.Field('updated_at', ['string']);
	services.Field('created_at', ['string']);
	services.Field('deleted_at', ['string']);
});

import './schema.js';

export default services;
