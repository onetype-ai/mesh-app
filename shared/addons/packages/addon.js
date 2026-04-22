import onetype from '@onetype/framework';

const packages = onetype.Addon('packages', (packages) =>
{
	packages.Table('mesh_packages');

	packages.Field('id', ['string']);
	packages.Field('team_id', ['string', null, true]);
	packages.Field('server_id', ['string']);
	packages.Field('name', ['string', null, true]);
	packages.Field('slug', ['string']);
	packages.Field('description', ['string']);
	packages.Field('overview', ['string']);
	packages.Field('version', ['string']);
	packages.Field('script_requirements_id', ['string']);
	packages.Field('script_install_id', ['string']);
	packages.Field('script_uninstall_id', ['string']);
	packages.Field('script_status_id', ['string']);
	packages.Field('config', ['object', {}]);
	packages.Field('installed_metric', ['string']);

	packages.Field('status',
	{
		type: 'string',
		value: 'Draft',
		required: true,
		options: ['Draft', 'Published']
	});

	packages.Field('platforms',
	{
		type: 'array',
		value: ['*'],
		each:
		{
			type: 'string',
			options: ['*', 'Linux', 'Darwin']
		}
	});

	packages.Field('is_marketplace', ['boolean', false]);
	packages.Field('is_verified', ['boolean', false]);

	packages.Field('updated_at', ['string']);
	packages.Field('created_at', ['string']);
	packages.Field('deleted_at', ['string']);
});

import './schema.js';

export default packages;
