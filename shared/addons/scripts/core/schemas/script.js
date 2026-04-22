import onetype from '@onetype/framework';

onetype.DataSchema('script', {
	id: ['string'],
	team_id: ['string'],
	service_id: ['string'],
	server_id: ['string'],
	package_id: ['string'],
	name: ['string', null, true],
	slug: ['string', ''],
	description: ['string', ''],
	status:
	{
		type: 'string',
		value: 'Draft',
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
	autorun: ['boolean', false],
	loop: ['number'],
	output:
	{
		type: 'string',
		value: 'Raw',
		options: ['Raw', 'JSON']
	},
	bash: ['string', null, true],
	hash: ['string'],
	config: ['object', {}],
	metrics: ['object', {}],
	updated_at: ['string'],
	created_at: ['string'],
	deleted_at: ['string']
});
