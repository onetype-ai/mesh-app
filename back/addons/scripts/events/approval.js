import onetype from '@onetype/framework';

onetype.EmitOn('@scripts.approval.needed', function({ server, script, hash })
{
	console.log('Approval needed:', server.Get('name'), '→', script.Get('name'), '(hash: ' + (hash || '').slice(0, 12) + '…)');
});
