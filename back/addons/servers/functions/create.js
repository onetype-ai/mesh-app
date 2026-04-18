import onetype from '@onetype/framework';
import servers from '#shared/servers/addon.js';
import scripts from '#shared/scripts/addon.js';

servers.Fn('create', async function(name, scriptIds = [])
{
	this.scripts = [];
	this.packages = [];
	this.services = [];

	const list = await scripts.Find()
		.filter('id', scriptIds, 'IN')
		.filter('deleted_at', null, 'NULL')
		.select(['id', 'package_id', 'service_id'])
		.join('packages', 'package_id', 'package', (join) =>
		{
			join.select(['id']);
			join.filter('deleted_at', null, 'NULL');
		})
		.many();

	for(const script of list)
	{
		this.scripts.push(script.Get('id'));

		const packageId = script.Get('package_id');

		if(packageId && !this.packages.includes(packageId))
		{
			this.packages.push(packageId);
		}

		const serviceId = script.Get('service_id');

		if(serviceId && !this.services.includes(serviceId))
		{
			this.services.push(serviceId);
		}
	}

	const server = servers.Item({
		name,
		scripts: this.scripts,
		packages: this.packages,
		services: this.services
	});

	await onetype.Middleware('servers.create.before', { server });

	await server.Create();

	await onetype.Middleware('servers.create.after', { server });

	onetype.Emit('servers.create', { server });

	return server;
});
