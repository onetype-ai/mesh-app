import onetype from '@onetype/framework';

const terminal = onetype.Addon('terminal', (terminal) =>
{
	terminal.Field('id',          ['number']);
	terminal.Field('server',      ['string', null, true]);
	terminal.Field('server_name', ['string', '']);
	terminal.Field('command_id',  ['string', '']);
	terminal.Field('stream',      ['string', '']);
	terminal.Field('sequence',    ['number', 0]);
	terminal.Field('output',      ['string', '']);
	terminal.Field('time',        ['string']);
	terminal.Field('end',         ['boolean', false]);
	terminal.Field('code',        ['number', 0]);
});

export default terminal;
