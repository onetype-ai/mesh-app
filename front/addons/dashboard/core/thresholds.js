/* ===== Threshold resolver: returns color for a value against schema thresholds. ===== */

onetype.AddonReady('dashboard', (dashboard) =>
{
	dashboard.Fn('threshold.color', function(value, thresholds)
	{
		if(value === null || value === undefined || isNaN(value))
		{
			return 'brand';
		}

		const list = (thresholds || []).slice().sort((a, b) => a.at - b.at);

		let color = 'brand';

		for(const entry of list)
		{
			if(value >= entry.at)
			{
				color = entry.color;
			}
		}

		return color;
	});

	dashboard.Fn('threshold.default', function(type)
	{
		if(type === 'percent')
		{
			return [
				{ at: 0,  color: 'green' },
				{ at: 60, color: 'orange' },
				{ at: 85, color: 'red' }
			];
		}

		return [];
	});
});
