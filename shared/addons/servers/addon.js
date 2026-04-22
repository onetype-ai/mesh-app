import onetype from '@onetype/framework';

const servers = onetype.Addon('servers', (servers) =>
{
	servers.Field('id', ['string']);
	servers.Field('team_id', ['string', null, true]);
	servers.Field('name', ['string', null, true]);
	servers.Field('token', ['string', null, true]);
	servers.Field('is_rented', ['boolean', false]);
	servers.Field('marketplace_id', ['string']);

	servers.Field('metrics', ['object', {}]);
	servers.Field('system_static', ['object', {}]);
	servers.Field('system_dynamic', ['object', {}]);
	servers.Field('system_refresh', ['number', 60]);
	servers.Field('status',
	{
		type: 'string',
		value: 'Inactive',
		required: true,
		options: ['Active', 'Inactive']
	});
	servers.Field('updated_at', ['string']);
	servers.Field('created_at', ['string']);
	servers.Field('deleted_at', ['string']);

	servers.Field('stream', { type: 'object', virtual: true });
	servers.Field('intervals', { type: 'array', value: [], virtual: true });

	servers.scripts = onetype.Addon('servers.scripts', (scripts) =>
	{
		scripts.Field('id', ['string']);
		scripts.Field('team_id', ['string', null, true]);
		scripts.Field('server_id', ['string', null, true]);
		scripts.Field('script_id', ['string', null, true]);
		scripts.Field('config', ['object', {}]);
		scripts.Field('updated_at', ['string']);
		scripts.Field('created_at', ['string']);
		scripts.Field('deleted_at', ['string']);
	});

	servers.packages = onetype.Addon('servers.packages', (packages) =>
	{
		packages.Field('id', ['string']);
		packages.Field('team_id', ['string', null, true]);
		packages.Field('server_id', ['string', null, true]);
		packages.Field('package_id', ['string', null, true]);
		packages.Field('config', ['object', {}]);
		packages.Field('updated_at', ['string']);
		packages.Field('created_at', ['string']);
		packages.Field('deleted_at', ['string']);
	});

	servers.services = onetype.Addon('servers.services', (services) =>
	{
		services.Field('id', ['string']);
		services.Field('team_id', ['string', null, true]);
		services.Field('server_id', ['string', null, true]);
		services.Field('service_id', ['string', null, true]);
		services.Field('config', ['object', {}]);
		services.Field('updated_at', ['string']);
		services.Field('created_at', ['string']);
		services.Field('deleted_at', ['string']);
	});
});

import './schema.js';

export default servers;
