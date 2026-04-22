import onetype from '@onetype/framework';
import servers from '#shared/servers/addon.js';

onetype.Pipeline('servers:scripts:detach', {
	description: 'Detach a script from a server — soft-deletes the servers_scripts row.',
	in: {
		server_id: ['string', null, true],
		script_id: ['string', null, true],
		team_id: ['string', null, true]
	}
})

.Join('load.link', 10, {
	description: 'Resolve the active servers_scripts row.',
	out: {
		link: ['object']
	},
	callback: async ({ server_id, script_id, team_id }, resolve) =>
	{
		const link = await servers.scripts.Find()
			.filter('server_id', server_id)
			.filter('script_id', script_id)
			.filter('team_id', team_id)
			.filter('deleted_at', null, 'NULL')
			.one();

		if(!link)
		{
			return resolve(null, 'Script is not attached to this server.', 404);
		}

		return { link };
	}
})

.Join('remove', 20, {
	description: 'Soft-delete the servers_scripts row.',
	requires: ['link'],
	callback: async ({ link }) =>
	{
		link.Set('deleted_at', new Date().toISOString());
		await link.Update();
	}
});
