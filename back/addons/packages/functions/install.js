import onetype from '@onetype/framework';
import packages from '#shared/packages/addon.js';
import scripts from '#shared/scripts/addon.js';

packages.Fn('install', async function(item, server)
{
	this.time = Date.now();
	this.script = await scripts.Find().filter('id', item.Get('script_install_id')).one();

	if(!this.script)
	{
		throw onetype.Error(400, 'Package has no install script.');
	}

	await onetype.Middleware('packages.install.before', { server, package: item });
	const result = await scripts.Fn('item.run', this.script, server);
	await onetype.Middleware('packages.install.after', { server, package: item, result });

	onetype.Emit('packages.install', { server, package: item, code: result.code ?? 200, result, time: Date.now() - this.time });

	return result;
});
