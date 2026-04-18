import scripts from '#shared/scripts/addon.js';

scripts.Fn('schema', function(item, values)
{
	const metrics = item.Get('metrics') || [];

	/* ===== Collect declared keys from all widgets ===== */
	const declared = new Set();

	for(const widget of metrics)
	{
		if(widget.key)
		{
			declared.add(widget.key);
		}
	}

	/* ===== Keep only declared keys, warn on missing ===== */
	const filtered = {};
	const missing = [];

	for(const key of declared)
	{
		if(key in values)
		{
			filtered[key] = values[key];
		}
		else
		{
			missing.push(key);
		}
	}

	return { values: filtered, missing };
});
