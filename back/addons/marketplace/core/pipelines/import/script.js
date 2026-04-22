import onetype from '@onetype/framework';
import scripts from '#shared/scripts/addon.js';

onetype.Pipeline('marketplace:import:script', {
	description: 'Import a marketplace script into a team library — duplicates the script under the target team.',
	in: {
		script_id: ['string', null, true],
		team_id: ['string', null, true]
	},
	out: {
		script: ['object', null, true]
	}
})

.Join('load.source', 10, {
	description: 'Resolve the source script — must be marketplace and Published.',
	out: {
		source: ['object']
	},
	callback: async ({ script_id }, resolve) =>
	{
		const source = await scripts.Find()
			.filter('id', script_id)
			.filter('is_marketplace', true)
			.filter('is_verified', true)
			.filter('status', 'Published')
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!source)
		{
			return resolve(null, 'Script not found in marketplace.', 404);
		}

		return { source };
	}
})

.Join('duplicate', 20, {
	description: 'Duplicate the script under the target team.',
	requires: ['source'],
	out: {
		script: ['object']
	},
	callback: async function({ source, team_id })
	{
		const { script } = await this.Pipeline('scripts:duplicate', {
			id: source.Get('id'),
			team_id
		});

		return { script };
	}
});
