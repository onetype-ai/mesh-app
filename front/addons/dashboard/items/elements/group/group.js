onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'dashboard-group',
		config:
		{
			name:
			{
				type: 'string',
				value: '',
				description: 'Group name (System, Docker, vLLM, ...).'
			},
			description:
			{
				type: 'string',
				value: ''
			},
			icon:
			{
				type: 'string',
				value: 'category'
			},
			source:
			{
				type: 'string',
				value: 'global',
				options: ['global', 'package', 'service'],
				description: 'Which kind of group this is.'
			},
			color:
			{
				type: 'string',
				value: 'brand',
				options: ['brand', 'blue', 'green', 'orange', 'red', 'neutral']
			},
			status:
			{
				type: 'string',
				value: '',
				description: 'Optional status pill (Running, Stopped, ...).'
			},
			statusColor:
			{
				type: 'string',
				value: 'green',
				options: ['green', 'orange', 'red', 'blue', 'neutral']
			},
			schema:
			{
				type: 'object',
				value: {},
				description: 'Metric schema: { key: { type, label, description, unit, placement, each, options, thresholds } }.'
			},
			snapshots:
			{
				type: 'array',
				value: [],
				description: 'Array of snapshots: [{ date, values: { key: value } }].'
			}
		},
		render: function()
		{
			const dashboard = onetype.Addon('dashboard');

			this.Compute(() =>
			{
				const schema = this.schema || {};
				const snapshots = this.snapshots || [];
				const entries = Object.entries(schema);

				/* Latest value lookup */
				const latest = snapshots[snapshots.length - 1] || { values: {} };
				const latestValues = latest.values || {};

				/* Build series lookup for sparklines / charts */
				const valueSeries = {};
				for(const [key] of entries)
				{
					valueSeries[key] = snapshots.map((s) => (s.values && s.values[key] !== undefined) ? s.values[key] : null).filter((v) => v !== null);
				}

				const chartLabels = snapshots.map((s) =>
				{
					if(!s.date) return '';
					const d = new Date(s.date);
					return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
				});

				this.chartLabels = chartLabels;

				/* Classify each metric: hero, details, list, series, histogram, boolean/status pill */
				const heroes = [];
				const stats = [];
				const lists = [];
				const charts = [];
				const histograms = [];

				for(const [key, spec] of entries)
				{
					const placement = spec.placement || 'details';

					if(placement === 'hidden')
					{
						continue;
					}

					const type = spec.type || 'text';
					const value = latestValues[key];
					const hasValue = value !== undefined && value !== null;

					if(type === 'list')
					{
						const columns = Object.entries(spec.each || {}).map(([colKey, colSpec]) =>
						{
							return {
								key: colKey,
								label: colSpec.label || colKey,
								type: colSpec.type || 'text',
								unit: colSpec.unit || '',
								align: (['bytes', 'number', 'gauge', 'counter', 'percent', 'duration', 'rate'].includes(colSpec.type)) ? 'right' : 'left'
							};
						});

						lists.push({
							key,
							label: spec.label || key,
							description: spec.description || '',
							icon: spec.icon || 'list',
							columns,
							items: Array.isArray(value) ? value : [],
							stale: !hasValue
						});
						continue;
					}

					if(type === 'series')
					{
						const series = snapshots.map((s) => (s.values && s.values[key] !== undefined && s.values[key] !== null) ? s.values[key] : null);
						charts.push({
							key,
							label: spec.label || key,
							description: spec.description || '',
							icon: spec.icon || 'show_chart',
							unit: spec.unit || '',
							series: [{ label: spec.label || key, color: this.color, values: series }],
							stale: series.filter((v) => v !== null).length === 0
						});
						continue;
					}

					if(type === 'histogram')
					{
						histograms.push({
							key,
							label: spec.label || key,
							description: spec.description || '',
							icon: spec.icon || 'bar_chart',
							unit: spec.unit || 'ms',
							value: value,
							color: this.color,
							stale: !hasValue
						});
						continue;
					}

					/* Scalar types — hero vs details */
					const iconMap = {
						boolean: 'check_circle',
						status: 'circle',
						version: 'tag',
						identifier: 'fingerprint',
						link: 'link',
						text: 'info',
						timestamp: 'schedule',
						duration: 'schedule',
						bytes: 'storage',
						percent: 'percent',
						rate: 'speed',
						counter: 'plus_one',
						gauge: 'query_stats'
					};

					const statEntry = {
						key,
						label: spec.label || key,
						description: spec.description || '',
						icon: spec.icon || iconMap[type] || 'circle',
						color: placement === 'hero' ? this.color : 'neutral',
						size: placement === 'hero' ? 'm' : 's',
						metricType: type,
						unit: spec.unit || '',
						value: hasValue ? value : null,
						series: valueSeries[key] || [],
						stale: !hasValue,
						sub: ''
					};

					if(placement === 'hero' && type === 'percent')
					{
						heroes.push({ kind: 'gauge', data: {
							key,
							label: spec.label || key,
							description: spec.description || '',
							icon: spec.icon || 'percent',
							size: 'm',
							value: hasValue ? value : null,
							thresholds: spec.thresholds || [],
							unit: spec.unit || '%',
							sub: '',
							stale: !hasValue
						}});
					}
					else if(placement === 'hero')
					{
						heroes.push({ kind: 'stat', data: statEntry });
					}
					else
					{
						stats.push(statEntry);
					}
				}

				this.heroes = heroes;
				this.stats = stats;
				this.lists = lists;
				this.charts = charts;
				this.histograms = histograms;

				this.hasHero = heroes.length > 0;
				this.hasStats = stats.length > 0;
				this.hasLists = lists.length > 0;
				this.hasCharts = charts.length > 0;
				this.hasHistograms = histograms.length > 0;
				this.isEmpty = !this.hasHero && !this.hasStats && !this.hasLists && !this.hasCharts && !this.hasHistograms;
			});

			return /* html */ `
				<section :class="'box source-' + source + ' accent-' + color">
					<div ot-if="hasHero" class="row-hero">
						<div ot-for="hero in heroes" class="hero-cell">
							<e-dashboard-gauge
								ot-if="hero.kind === 'gauge'"
								:label="hero.data.label"
								:description="hero.data.description"
								:icon="hero.data.icon"
								:size="hero.data.size"
								:value="hero.data.value"
								:thresholds="hero.data.thresholds"
								:unit="hero.data.unit"
								:stale="hero.data.stale"
							></e-dashboard-gauge>
							<e-dashboard-stat
								ot-if="hero.kind === 'stat'"
								:label="hero.data.label"
								:description="hero.data.description"
								:icon="hero.data.icon"
								:color="hero.data.color"
								:size="hero.data.size"
								:metric-type="hero.data.metricType"
								:unit="hero.data.unit"
								:value="hero.data.value"
								:series="hero.data.series"
								:stale="hero.data.stale"
								:sub="hero.data.sub"
							></e-dashboard-stat>
						</div>
					</div>

					<div ot-if="hasCharts" class="row-charts">
						<e-dashboard-chart
							ot-for="chart in charts"
							:label="chart.label"
							:description="chart.description"
							:icon="chart.icon"
							:series="chart.series"
							:labels="chartLabels"
							:unit="chart.unit"
							:stale="chart.stale"
						></e-dashboard-chart>
					</div>

					<div ot-if="hasStats" class="row-stats">
						<e-dashboard-stat
							ot-for="stat in stats"
							:label="stat.label"
							:description="stat.description"
							:icon="stat.icon"
							:color="stat.color"
							:size="stat.size"
							:metric-type="stat.metricType"
							:unit="stat.unit"
							:value="stat.value"
							:series="stat.series"
							:stale="stat.stale"
						></e-dashboard-stat>
					</div>

					<div ot-if="hasLists" class="row-lists">
						<e-dashboard-list
							ot-for="list in lists"
							:label="list.label"
							:description="list.description"
							:icon="list.icon"
							:columns="list.columns"
							:items="list.items"
							:stale="list.stale"
						></e-dashboard-list>
					</div>

					<div ot-if="hasHistograms" class="row-histograms">
						<e-dashboard-histogram
							ot-for="h in histograms"
							:label="h.label"
							:description="h.description"
							:icon="h.icon"
							:color="h.color"
							:value="h.value"
							:unit="h.unit"
							:stale="h.stale"
						></e-dashboard-histogram>
					</div>

					<div ot-if="isEmpty" class="empty">
						<i>inbox</i>
						<span>No metrics declared yet.</span>
					</div>
				</section>
			`;
		}
	});
});
