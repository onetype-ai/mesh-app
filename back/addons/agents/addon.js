import onetype from '@onetype/framework';

const agents = onetype.Addon('agents', (agents) =>
{
	agents.Field('id', ['string']);
	agents.Field('server', ['function']);
	agents.Field('stream', ['function']);
	agents.Field('bash', ['function']);
	agents.Field('approve', ['function']);
	agents.Field('intervals', ['object', {}]);
});

export default agents;
