import onetype from '@onetype/framework';

onetype.DataSchema('package', {
	id: ['string'],
	team_id: ['string'],
	server_id: ['string'],
	name: ['string', null, true],
	slug: ['string', ''],
	description: ['string', ''],
	overview: ['string', ''],
	version: ['string', ''],
	script_requirements_id: ['string'],
	script_install_id: ['string'],
	script_uninstall_id: ['string'],
	script_status_id: ['string'],
	config: ['object', {}],
	installed_metric: ['string', ''],
	status:
	{
		type: 'string',
		value: 'Draft',
		required: true,
		options: ['Draft', 'Published']
	},
	platforms:
	{
		type: 'array',
		value: ['*'],
		each:
		{
			type: 'string',
			options: ['*', 'Linux', 'Darwin']
		}
	},
	is_marketplace: ['boolean', false],
	is_verified: ['boolean', false],
	updated_at: ['string'],
	created_at: ['string'],
	deleted_at: ['string']
});
