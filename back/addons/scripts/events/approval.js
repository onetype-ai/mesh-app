import onetype from '@onetype/framework';

onetype.EmitOn('scripts.approval', function({ server, script, hash })
{
	console.log('Approval needed:', server.Get('name'), '→', script.Get('name'), '(hash: ' + (hash || '').slice(0, 12) + '…)');
});
