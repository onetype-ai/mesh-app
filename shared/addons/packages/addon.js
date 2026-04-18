import onetype from '@onetype/framework';

const packages = onetype.Addon('packages', (packages) =>
{
	packages.Table('mesh_packages');

	packages.Field('id', ['string', null, true]);
	packages.Field('team_id', ['string', null, true]);
	packages.Field('name', ['string', null, true]);
	packages.Field('description', ['string']);
	packages.Field('version', ['string']);
	packages.Field('script_install_id', ['string']);
	packages.Field('script_uninstall_id', ['string']);
	packages.Field('script_status_id', ['string']);
	packages.Field('installed_condition', ['string']);

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
			options: ['*', 'linux', 'darwin']
		}
	});

	packages.Field('is_marketplace', ['boolean', false]);
	packages.Field('is_global', ['boolean', false]);

	packages.Field('updated_at', ['string']);
	packages.Field('created_at', ['string']);
	packages.Field('deleted_at', ['string']);
});

export default packages;
