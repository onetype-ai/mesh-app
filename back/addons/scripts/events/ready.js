import onetype from '@onetype/framework';
import scripts from '#shared/scripts/addon.js';

onetype.EmitOn('@servers.http.start', async () =>
{
	/* ===== Load all global scripts into the addon at boot ===== */
	await scripts.Find()
		.filter('is_global', true)
		.filter('status', 'Published')
		.filter('deleted_at', null, 'NULL')
		.limit(1000)
		.many(true);

	console.log('Global scripts loaded:', Object.keys(scripts.Items()).length);
});
