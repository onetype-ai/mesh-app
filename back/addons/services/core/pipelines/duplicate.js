import onetype from '@onetype/framework';
import services from '#shared/services/addon.js';
import scripts from '#shared/scripts/addon.js';

onetype.Pipeline('services:duplicate', {
	description: 'Duplicate a service (and all its scripts) into a team library.',
	in: {
		id: ['string', null, true],
		team_id: ['string', null, true]
	},
	out: {
		service: ['object', null, true]
	}
})

.Join('load', 10, {
	description: 'Load source service and all of its scripts.',
	out: {
		source: ['object'],
		sourceScripts: ['array']
	},
	callback: async ({ id }, resolve) =>
	{
		const source = await services.Find()
			.filter('id', id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!source)
		{
			return resolve(null, 'Service ' + id + ' not found.', 404);
		}

		const sourceScripts = await scripts.Find()
			.filter('service_id', source.Get('id'))
			.filter('deleted_at', null, 'NULL')
			.many();

		const sourceIds = new Set(sourceScripts.map((item) => String(item.Get('id'))));
		const references = [
			'script_requirements_id',
			'script_deploy_id',
			'script_start_id',
			'script_stop_id',
			'script_restart_id',
			'script_destroy_id',
			'script_status_id'
		];

		for(const field of references)
		{
			const referenced = source.Get(field);

			if(referenced && !sourceIds.has(String(referenced)))
			{
				return resolve(null, 'Service ' + id + ' references script ' + referenced + ' that does not belong to it.', 400);
			}
		}

		return { source, sourceScripts };
	}
})

.Join('create', 20, {
	description: 'Create the duplicated service shell under the target team.',
	requires: ['source'],
	out: {
		service: ['object']
	},
	callback: async function({ source, team_id })
	{
		const data = source.GetData();

		const service = services.Item({
			team_id,
			name: data.name,
			slug: data.slug,
			description: data.description,
			overview: data.overview,
			version: data.version,
			config: data.config,
			deployed_metric: data.deployed_metric,
			running_metric: data.running_metric,
			platforms: data.platforms,
			is_marketplace: false,
			is_verified: false,
			status: data.status
		});

		await service.Create({ connection: this.wrap.transaction });

		return { service };
	}
})

.Join('scripts', 30, {
	description: 'Duplicate every script of the source service and remember the id mapping.',
	requires: ['source', 'sourceScripts', 'service'],
	out: {
		scriptMap: ['object']
	},
	callback: async function({ sourceScripts, service, team_id })
	{
		const scriptMap = {};

		for(const item of sourceScripts)
		{
			const { script } = await this.Pipeline('scripts:duplicate', {
				id: item.Get('id'),
				team_id,
				service_id: service.Get('id')
			});

			scriptMap[String(item.Get('id'))] = script.Get('id');
		}

		return { scriptMap };
	}
})

.Join('rewire', 40, {
	description: 'Rewire the new service script_*_id fields using the id mapping.',
	requires: ['source', 'service', 'scriptMap'],
	callback: async function({ source, service, scriptMap })
	{
		const fields = [
			'script_requirements_id',
			'script_deploy_id',
			'script_start_id',
			'script_stop_id',
			'script_restart_id',
			'script_destroy_id',
			'script_status_id'
		];

		for(const field of fields)
		{
			const old = source.Get(field);

			if(old)
			{
				service.Set(field, scriptMap[String(old)]);
			}
		}

		await service.Update({ connection: this.wrap.transaction });
	}
});
