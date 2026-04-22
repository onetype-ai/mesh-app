import onetype from '@onetype/framework';
import commands from '@onetype/framework/commands';
import scripts from '#shared/scripts/addon.js';

commands.Item({
	id: 'scripts:unpublish',
	exposed: true,
	method: 'POST',
	endpoint: '/api/scripts/:id/unpublish',
	in: {
		id: ['string', null, true]
	},
	out: 'script',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const item = await scripts.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.one();

		if(!item)
		{
			return resolve(null, 'Script not found.', 404);
		}

		const result = await onetype.PipelineRun('scripts:unpublish', { id: properties.id }, { state: this.http.state });

		if(result.code !== 200)
		{
			return resolve(null, result.message, result.code);
		}

		const fresh = await scripts.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.one();

		resolve(fresh ? fresh.GetData() : item.GetData());
	}
});
