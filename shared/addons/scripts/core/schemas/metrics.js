import onetype from '@onetype/framework';

/* ===== Metric entry schema ===== */

/*
	Used inside script.metrics to declare every emitted metric.
	Key is the dot-path (system.cpu.usage). Schema describes type + render hints.

	Example:
		metrics: {
			'system.cpu.usage':  { type: 'percent',  label: 'CPU usage',  description: 'Current CPU load.' },
			'system.ram.total':  { type: 'bytes',    label: 'RAM total',  description: 'Total installed RAM.' },
			'system.disk':       { type: 'list',     label: 'Disks',      each: { device: { type: 'text' }, total: { type: 'bytes' } } },
			'system.cpu.series': { type: 'series',   label: 'CPU history' }
		}
*/

onetype.DataSchema('metric', {
	type:
	{
		type: 'string',
		required: true,
		options: [
			'gauge',        /* number that fluctuates (cpu, ram used, temperature) */
			'counter',      /* monotonic number (bytes sent, requests total) */
			'rate',         /* already-computed per-second rate (req/s) */
			'percent',      /* number 0-100 with thresholds */
			'bytes',        /* number auto-formatted to KB/MB/GB */
			'duration',     /* number (seconds) → "2h 14m" */
			'timestamp',    /* ISO/unix → "3m ago" */
			'status',       /* enum with colored pill */
			'boolean',      /* ✓/✗ */
			'text',         /* plain string */
			'version',      /* semver with compare */
			'identifier',   /* hash/id, monospaced, copy-on-click */
			'link',         /* clickable url */
			'list',         /* array of objects — expandable table */
			'series',       /* [[timestamp, number], ...] — line chart */
			'histogram'     /* {buckets, sum, count} — p50/p95/p99 */
		],
		description: 'Render and shape type.'
	},
	label:
	{
		type: 'string',
		value: '',
		description: 'Human-readable label shown in dashboards.'
	},
	description:
	{
		type: 'string',
		value: '',
		description: 'Help text shown on hover / in docs.'
	},
	unit:
	{
		type: 'string',
		value: '',
		description: 'Unit suffix (celsius, hz, req, ops, mb, ...). Drives formatting within type.'
	},
	placement:
	{
		type: 'string',
		value: 'details',
		options: ['hero', 'details', 'hidden'],
		description: 'Dashboard placement hint.'
	},
	options:
	{
		type: 'array',
		value: [],
		each: { type: 'string' },
		description: 'For type=status: allowed values.'
	},
	thresholds:
	{
		type: 'array',
		value: [],
		each:
		{
			type: 'object',
			config:
			{
				at: ['number', null, true],
				color:
				{
					type: 'string',
					value: 'green',
					options: ['green', 'orange', 'red', 'blue', 'brand']
				}
			}
		},
		description: 'For gauge/percent: color thresholds at value crossings.'
	},
	each:
	{
		type: 'object',
		value: {},
		description: 'For type=list: nested metric schema per row field.'
	}
});
