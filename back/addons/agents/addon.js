import onetype from '@onetype/framework';

const agents = onetype.Addon('agents', (agents) =>
{
	agents.Field('id', ['string']);
	agents.Field('server', ['function']);
	agents.Field('stream', ['function']);
	agents.Field('bash', ['function']);
	agents.Field('approve', ['function']);
	agents.Field('revoke', ['function']);
	agents.Field('cancel', ['function']);
	agents.Field('proxy_open', ['function']);
	agents.Field('proxy_data', ['function']);
	agents.Field('proxy_close', ['function']);
	agents.Field('intervals', ['object', {}]);
});

export default agents;
