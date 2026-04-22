import agents from '#agents/addon.js';

agents.ItemOn('removed', (agent) =>
{
	const intervals = agent.Get('intervals');

	for(const handle of Object.values(intervals))
	{
		clearTimeout(handle);
	}
});
