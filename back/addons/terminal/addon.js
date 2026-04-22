import onetype from '@onetype/framework';

const terminal = onetype.Addon('terminal', (terminal) =>
{
	terminal.Field('id',          ['number']);
	terminal.Field('server',      ['string', null, true]);
	terminal.Field('server_name', ['string', '']);
	terminal.Field('output',      ['string', '']);
	terminal.Field('time',        ['string']);
});

export default terminal;
