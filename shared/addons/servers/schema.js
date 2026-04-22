import onetype from '@onetype/framework';

onetype.DataSchema('server', {
	id: ['string'],
	team_id: ['string'],
	name: ['string', null, true],
	token: ['string'],
	is_rented: ['boolean', false],
	marketplace_id: ['string'],
	metrics: ['object', {}],
	system_static: ['object', {}],
	system_dynamic: ['object', {}],
	system_refresh: ['number', 60],
	status:
	{
		type: 'string',
		value: 'Inactive',
		options: ['Active', 'Inactive']
	},
	updated_at: ['string'],
	created_at: ['string'],
	deleted_at: ['string']
});

onetype.DataSchema('servers.script', {
	id: ['string'],
	team_id: ['string'],
	server_id: ['string', null, true],
	script_id: ['string', null, true],
	config: ['object', {}],
	updated_at: ['string'],
	created_at: ['string'],
	deleted_at: ['string']
});

onetype.DataSchema('servers.package', {
	id: ['string'],
	team_id: ['string'],
	server_id: ['string', null, true],
	package_id: ['string', null, true],
	config: ['object', {}],
	updated_at: ['string'],
	created_at: ['string'],
	deleted_at: ['string']
});

onetype.DataSchema('servers.service', {
	id: ['string'],
	team_id: ['string'],
	server_id: ['string', null, true],
	service_id: ['string', null, true],
	config: ['object', {}],
	updated_at: ['string'],
	created_at: ['string'],
	deleted_at: ['string']
});
