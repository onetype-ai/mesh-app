import commands from '@onetype/framework/commands';
import approvals from '#shared/approvals/addon.js';

commands.Item({
	id: 'approvals:one',
	exposed: true,
	method: 'GET',
	endpoint: '/api/approvals/:id',
	in: {
		id: ['string', null, true]
	},
	out: 'approval',
	callback: async function(properties, resolve)
	{
		if(!this.http.state.user)
		{
			return resolve(null, 'Login required.', 401);
		}

		const item = await approvals.Find()
			.filter('id', properties.id)
			.filter('team_id', this.http.state.user.team.id)
			.one();

		if(!item)
		{
			return resolve(null, 'Approval not found.', 404);
		}

		resolve(item.GetData());
	}
});
