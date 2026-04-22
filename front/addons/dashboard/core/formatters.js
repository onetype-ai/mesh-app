/* ===== Shared formatters for every dashboard widget ===== */

onetype.AddonReady('dashboard', (dashboard) =>
{
	dashboard.Fn('format.bytes', function(value)
	{
		value = Number(value);
		if(value === null || value === undefined || isNaN(value))
		{
			return '—';
		}

		const abs = Math.abs(value);

		if(abs < 1024)
		{
			return value + ' B';
		}

		const units = ['KB', 'MB', 'GB', 'TB', 'PB'];
		let unit = units[0];
		let scaled = value / 1024;
		let i = 0;

		while(Math.abs(scaled) >= 1024 && i < units.length - 1)
		{
			scaled /= 1024;
			i++;
			unit = units[i];
		}

		return scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0) + ' ' + unit;
	});

	dashboard.Fn('format.number', function(value, unit)
	{
		value = Number(value);
		if(value === null || value === undefined || isNaN(value))
		{
			return '—';
		}

		const abs = Math.abs(value);
		let formatted;

		if(abs >= 1_000_000_000)
		{
			formatted = (value / 1_000_000_000).toFixed(1) + 'B';
		}
		else if(abs >= 1_000_000)
		{
			formatted = (value / 1_000_000).toFixed(1) + 'M';
		}
		else if(abs >= 10_000)
		{
			formatted = (value / 1_000).toFixed(1) + 'K';
		}
		else if(Number.isInteger(value))
		{
			formatted = String(value);
		}
		else
		{
			formatted = value.toFixed(Math.abs(value) < 1 ? 3 : 2);
		}

		return unit ? formatted + ' ' + unit : formatted;
	});

	dashboard.Fn('format.percent', function(value)
	{
		value = Number(value);
		if(value === null || value === undefined || isNaN(value))
		{
			return '—';
		}

		return value.toFixed(value < 10 ? 1 : 0) + '%';
	});

	dashboard.Fn('format.duration', function(seconds)
	{
		seconds = Number(seconds);
		if(seconds === null || seconds === undefined || isNaN(seconds))
		{
			return '—';
		}

		if(seconds < 60)
		{
			return Math.floor(seconds) + 's';
		}

		if(seconds < 3600)
		{
			return Math.floor(seconds / 60) + 'm ' + Math.floor(seconds % 60) + 's';
		}

		if(seconds < 86400)
		{
			const h = Math.floor(seconds / 3600);
			const m = Math.floor((seconds % 3600) / 60);
			return h + 'h ' + m + 'm';
		}

		const d = Math.floor(seconds / 86400);
		const h = Math.floor((seconds % 86400) / 3600);
		return d + 'd ' + h + 'h';
	});

	dashboard.Fn('format.timeago', function(iso)
	{
		if(!iso)
		{
			return '—';
		}

		const then = new Date(iso).getTime();

		if(isNaN(then))
		{
			return '—';
		}

		const diff = Math.floor((Date.now() - then) / 1000);

		if(diff < 5)
		{
			return 'just now';
		}

		if(diff < 60)
		{
			return diff + 's ago';
		}

		if(diff < 3600)
		{
			return Math.floor(diff / 60) + 'm ago';
		}

		if(diff < 86400)
		{
			return Math.floor(diff / 3600) + 'h ago';
		}

		return Math.floor(diff / 86400) + 'd ago';
	});

	dashboard.Fn('format.rate', function(value, unit)
	{
		if(value === null || value === undefined || isNaN(value))
		{
			return '—';
		}

		const suffix = unit || 'req/s';
		return dashboard.Fn('format.number', value) + ' ' + suffix;
	});

	dashboard.Fn('format.value', function(type, value, unit)
	{
		if(value === null || value === undefined)
		{
			return '—';
		}

		if(type === 'bytes') return dashboard.Fn('format.bytes', value);
		if(type === 'percent') return dashboard.Fn('format.percent', value);
		if(type === 'duration') return dashboard.Fn('format.duration', value);
		if(type === 'timestamp') return dashboard.Fn('format.timeago', value);
		if(type === 'rate') return dashboard.Fn('format.rate', value, unit);
		if(type === 'counter' || type === 'gauge' || type === 'number') return dashboard.Fn('format.number', value, unit);
		if(type === 'boolean') return value ? 'Yes' : 'No';
		if(type === 'version') return 'v' + String(value).replace(/^v/, '');
		if(type === 'identifier') return String(value).length > 12 ? String(value).slice(0, 8) + '…' + String(value).slice(-4) : String(value);

		return String(value);
	});
});
