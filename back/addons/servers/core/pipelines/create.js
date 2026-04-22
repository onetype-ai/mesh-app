import onetype from '@onetype/framework';
import database from '@onetype/framework/database';
import servers from '#shared/servers/addon.js';
import scripts from '#shared/scripts/addon.js';
import packages from '#shared/packages/addon.js';
import services from '#shared/services/addon.js';

onetype.Pipeline('servers:create', {
	description: 'Create a server and duplicate selected scripts, packages and services for it.',
	wrap: (run) => database.Fn('transaction', (transaction) => run({ transaction })),
	in: {
		team_id: ['string', null, true],
		name: ['string', null, true],
		scripts: { type: 'array', value: [], each: ['string'] },
		packages: { type: 'array', value: [], each: ['string'] },
		services: { type: 'array', value: [], each: ['string'] }
	},
	out: {
		server: ['object', null, true]
	}
})

.Join('validate', 10, {
	description: 'Verify every selected script, package and service belongs to the team and is Published.',
	callback: async ({ team_id, scripts: scriptIds, packages: packageIds, services: serviceIds }, resolve) =>
	{
		const check = async (addon, ids, label) =>
		{
			if(!ids.length)
			{
				return;
			}

			const found = await addon.Find()
				.filter('id', ids, 'IN')
				.filter('status', 'Published')
				.filter('deleted_at', null, 'NULL')
				.group('AND')
					.filter('team_id', team_id)
				.end()
				.group('OR')
					.filter('team_id', null, 'NULL')
					.filter('is_marketplace', true)
					.filter('is_verified', true)
				.end()
				.many();

			const foundIds = new Set(found.map((item) => String(item.Get('id'))));

			for(const id of ids)
			{
				if(!foundIds.has(String(id)))
				{
					throw onetype.Error(400, label + ' ' + id + ' not found or not published.');
				}
			}
		};

		try
		{
			await check(scripts, scriptIds, 'Script');
			await check(packages, packageIds, 'Package');
			await check(services, serviceIds, 'Service');
		}
		catch(error)
		{
			return resolve(null, error.message, error.code || 400);
		}
	}
})

.Join('create', 20, {
	description: 'Create the server record.',
	out: {
		server: ['object']
	},
	callback: async function({ team_id, name })
	{
		const server = servers.Item({
			team_id,
			name,
			token: onetype.GenerateString(64)
		});

		await server.Create({ connection: this.wrap.transaction });

		return { server };
	}
})

.Join('duplicate.scripts', 30, {
	description: 'Duplicate every selected script and attach to the server.',
	requires: ['server'],
	callback: async function({ server, team_id, scripts: scriptIds })
	{
		for(const id of scriptIds)
		{
			await this.Pipeline('scripts:duplicate', {
				id,
				team_id,
				server_id: server.Get('id')
			});
		}
	}
})

.Join('duplicate.packages', 40, {
	description: 'Duplicate every selected package (cascading its scripts) and attach to the server.',
	requires: ['server'],
	callback: async function({ server, team_id, packages: packageIds })
	{
		for(const id of packageIds)
		{
			await this.Pipeline('packages:duplicate', {
				id,
				team_id,
				server_id: server.Get('id')
			});
		}
	}
})

.Join('duplicate.services', 50, {
	description: 'Duplicate every selected service (cascading its scripts) and attach to the server.',
	requires: ['server'],
	callback: async function({ server, team_id, services: serviceIds })
	{
		for(const id of serviceIds)
		{
			await this.Pipeline('services:duplicate', {
				id,
				team_id,
				server_id: server.Get('id')
			});
		}
	}
})

.Test('creates server with scripts and rolls back after', {
	properties: { team_id: '17', name: 'Test RT', scripts: ['1', '2'], packages: ['1'], services: [] },
	code: 200
});
