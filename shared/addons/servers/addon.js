import onetype from '@onetype/framework';

const servers = onetype.Addon('servers', (servers) =>
{
	servers.Field('id', ['string']);
	servers.Field('team_id', ['string', null, true]);
	servers.Field('name', ['string', null, true]);
	servers.Field('token', ['string'], null, (value) => value || onetype.GenerateString(64));
	servers.Field('is_rented', ['boolean', false]);
	servers.Field('marketplace_id', ['string']);

	servers.Field('metrics', ['object', {}]);
	servers.Field('status', ['string', 'Inactive']);
	servers.Field('updated_at', ['string']);
	servers.Field('created_at', ['string']);
	servers.Field('deleted_at', ['string']);

	servers.Field('stream', { type: 'object', virtual: true });
	servers.Field('exec', { type: 'function', virtual: true });
	servers.Field('approve', { type: 'function', virtual: true });
	servers.Field('intervals', { type: 'array', virtual: true });
});

export default servers;
