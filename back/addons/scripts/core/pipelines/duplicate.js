import onetype from '@onetype/framework';
import scripts from '#shared/scripts/addon.js';

onetype.Pipeline('scripts:duplicate', {
	description: 'Duplicate a script into a team library.',
	in: {
		id: ['string', null, true],
		team_id: ['string', null, true],
		package_id: ['string'],
		service_id: ['string']
	},
	out: {
		script: ['object', null, true]
	}
})

.Join('load', 10, {
	description: 'Load source script.',
	out: {
		source: ['object']
	},
	callback: async ({ id }, resolve) =>
	{
		const source = await scripts.Find()
			.filter('id', id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!source)
		{
			return resolve(null, 'Script ' + id + ' not found.', 404);
		}

		return { source };
	}
})

.Join('duplicate', 20, {
	description: 'Create a copy of the script in the target team.',
	requires: ['source'],
	out: {
		script: ['object']
	},
	callback: async function({ source, team_id, package_id, service_id })
	{
		const data = source.GetData();

		const script = scripts.Item({
			team_id,
			package_id: package_id || null,
			service_id: service_id || null,
			name: data.name,
			slug: data.slug,
			description: data.description,
			platforms: data.platforms,
			autorun: data.autorun,
			loop: data.loop,
			output: data.output,
			bash: data.bash,
			hash: data.hash,
			config: data.config,
			metrics: data.metrics,
			is_marketplace: false,
			is_verified: false,
			status: data.status
		});

		await script.Create({ connection: this.wrap.transaction });

		return { script };
	}
});
