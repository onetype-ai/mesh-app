import onetype from '@onetype/framework';
import packages from '#shared/packages/addon.js';
import scripts from '#shared/scripts/addon.js';

onetype.Pipeline('packages:duplicate', {
	description: 'Duplicate a package (and all its scripts) into a team library.',
	in: {
		id: ['string', null, true],
		team_id: ['string', null, true]
	},
	out: {
		package: ['object', null, true]
	}
})

.Join('load', 10, {
	description: 'Load source package and all of its scripts.',
	out: {
		source: ['object'],
		sourceScripts: ['array']
	},
	callback: async ({ id }, resolve) =>
	{
		const source = await packages.Find()
			.filter('id', id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!source)
		{
			return resolve(null, 'Package ' + id + ' not found.', 404);
		}

		const sourceScripts = await scripts.Find()
			.filter('package_id', source.Get('id'))
			.filter('deleted_at', null, 'NULL')
			.many();

		const sourceIds = new Set(sourceScripts.map((item) => String(item.Get('id'))));
		const references = ['script_requirements_id', 'script_install_id', 'script_uninstall_id', 'script_status_id'];

		for(const field of references)
		{
			const referenced = source.Get(field);

			if(referenced && !sourceIds.has(String(referenced)))
			{
				return resolve(null, 'Package ' + id + ' references script ' + referenced + ' that does not belong to it.', 400);
			}
		}

		return { source, sourceScripts };
	}
})

.Join('create', 20, {
	description: 'Create the duplicated package shell under the target team.',
	requires: ['source'],
	out: {
		package: ['object']
	},
	callback: async function({ source, team_id })
	{
		const data = source.GetData();

		const pkg = packages.Item({
			team_id,
			name: data.name,
			slug: data.slug,
			description: data.description,
			overview: data.overview,
			version: data.version,
			config: data.config,
			installed_metric: data.installed_metric,
			platforms: data.platforms,
			is_marketplace: false,
			is_verified: false,
			status: data.status
		});

		await pkg.Create({ connection: this.wrap.transaction });

		return { package: pkg };
	}
})

.Join('scripts', 30, {
	description: 'Duplicate every script of the source package and remember the id mapping.',
	requires: ['source', 'sourceScripts', 'package'],
	out: {
		scriptMap: ['object']
	},
	callback: async function({ sourceScripts, package: pkg, team_id })
	{
		const scriptMap = {};

		for(const item of sourceScripts)
		{
			const { script } = await this.Pipeline('scripts:duplicate', {
				id: item.Get('id'),
				team_id,
				package_id: pkg.Get('id')
			});

			scriptMap[String(item.Get('id'))] = script.Get('id');
		}

		return { scriptMap };
	}
})

.Join('rewire', 40, {
	description: 'Rewire the new package script_*_id fields using the id mapping.',
	requires: ['source', 'package', 'scriptMap'],
	callback: async function({ source, package: pkg, scriptMap })
	{
		const fields = ['script_requirements_id', 'script_install_id', 'script_uninstall_id', 'script_status_id'];

		for(const field of fields)
		{
			const old = source.Get(field);

			if(old)
			{
				pkg.Set(field, scriptMap[String(old)]);
			}
		}

		await pkg.Update({ connection: this.wrap.transaction });
	}
});
