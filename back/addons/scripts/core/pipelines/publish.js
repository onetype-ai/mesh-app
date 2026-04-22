import onetype from '@onetype/framework';
import scripts from '#shared/scripts/addon.js';

onetype.Pipeline('scripts:publish', {
	description: 'Publish a script after validating required fields and metrics.',
	in: {
		id: ['string', null, true]
	}
})
.Join('load', 10, {
	description: 'Load script and verify ownership.',
	out: {
		item: ['object', null, true],
		previous: ['string', null, true]
	},
	callback: async ({ id }, resolve) =>
	{
		const item = await scripts.Find().filter('id', id).one();

		if(!item)
		{
			return resolve(null, 'Script not found.', 404);
		}

		return { item, previous: item.Get('status') };
	}
})
.Join('validate', 20, {
	description: 'Validate that the script meets publish requirements.',
	requires: ['item'],
	callback: async ({ item }, resolve) =>
	{
		const name = item.Get('name');
		const bash = item.Get('bash');
		const platforms = item.Get('platforms');
		const loop = item.Get('loop');
		const output = item.Get('output');
		const metrics = item.Get('metrics');

		if(!name || !name.trim())
		{
			return resolve(null, 'Script must have a name.', 400);
		}

		if(!bash || !bash.trim())
		{
			return resolve(null, 'Script must have bash content.', 400);
		}

		if(!platforms || !platforms.length)
		{
			return resolve(null, 'Script must target at least one platform.', 400);
		}

		if(loop && loop > 0 && output !== 'JSON')
		{
			return resolve(null, 'Looping scripts must output JSON.', 400);
		}

		if(output === 'JSON' && (!metrics || typeof metrics !== 'object' || Object.keys(metrics).length === 0))
		{
			return resolve(null, 'JSON output scripts must declare at least one metric.', 400);
		}
	}
})
.Join('publish', 30, {
	description: 'Set status to Published.',
	requires: ['item'],
	callback: async ({ item }, resolve) =>
	{
		item.Set('status', 'Published');
		await item.Update();
	},
	rollback: async ({ item, previous }) =>
	{
		if(item && previous)
		{
			item.Set('status', previous);
			await item.Update();
		}
	}
});
