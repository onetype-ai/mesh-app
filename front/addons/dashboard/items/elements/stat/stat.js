onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'dashboard-stat',
		config:
		{
			label:
			{
				type: 'string',
				value: '',
				description: 'Metric label.'
			},
			description:
			{
				type: 'string',
				value: '',
				description: 'Help text.'
			},
			icon:
			{
				type: 'string',
				value: '',
				description: 'Leading icon.'
			},
			color:
			{
				type: 'string',
				value: 'brand',
				options: ['brand', 'blue', 'green', 'orange', 'red', 'neutral'],
				description: 'Accent color.'
			},
			size:
			{
				type: 'string',
				value: 'm',
				options: ['s', 'm', 'l', 'xl']
			},
			metricType:
			{
				type: 'string',
				value: 'gauge',
				description: 'Source metric type (gauge, counter, rate, bytes, duration, timestamp, text, version, identifier, link, boolean, status).'
			},
			unit:
			{
				type: 'string',
				value: '',
				description: 'Unit suffix for the formatted value.'
			},
			value:
			{
				type: 'string|number|boolean',
				value: null,
				description: 'Latest value.'
			},
			series:
			{
				type: 'array',
				value: [],
				each: { type: 'number' },
				description: 'Optional numeric history for sparkline.'
			},
			trend:
			{
				type: 'number',
				value: null,
				description: 'Optional trend delta (positive = up).'
			},
			sub:
			{
				type: 'string',
				value: '',
				description: 'Optional sub-label shown under the value.'
			},
			stale:
			{
				type: 'boolean',
				value: false
			}
		},
		render: function()
		{
			const dashboard = onetype.Addon('dashboard');

			this.Compute(() =>
			{
				const type = this.metricType || 'gauge';
				console.log('[stat]', this.label, 'type:', type, 'value:', this.value, 'typeof:', typeof this.value);
				this.formatted = dashboard.Fn('format.value', type, this.value, this.unit);

				this.showSparkline = Array.isArray(this.series) && this.series.length > 1 && ['gauge', 'counter', 'rate', 'bytes', 'duration', 'percent'].includes(type);

				this.isBool = type === 'boolean';
				this.isLink = type === 'link' && this.value;
				this.linkHref = this.isLink ? String(this.value) : '';
				this.linkLabel = this.isLink ? String(this.value).replace(/^https?:\/\//, '').replace(/\/$/, '') : '';

				this.isCopy = type === 'identifier' && this.value;

				this.trendDirection = null;
				this.trendFormatted = '';

				if(this.trend !== null && this.trend !== undefined && !isNaN(this.trend) && this.trend !== 0)
				{
					this.trendDirection = this.trend > 0 ? 'up' : 'down';
					this.trendFormatted = (this.trend > 0 ? '+' : '') + this.trend.toFixed(Math.abs(this.trend) < 1 ? 2 : 1);
				}
			});

			this.handleCopy = (event) =>
			{
				if(!this.value) return;
				event.preventDefault();
				navigator.clipboard.writeText(String(this.value));
				$ot.toast({ message: 'Copied.', type: 'success', duration: 1500 });
			};

			return /* html */ `
				<e-dashboard-widget
					:label="label"
					:description="description"
					:icon="icon"
					:color="color"
					:size="size"
					:stale="stale"
				>
					<div slot="body" class="stat-body">
						<div class="value-row">
							<a ot-if="isLink" :href="linkHref" target="_blank" rel="noopener" class="value link">
								<span>{{ linkLabel }}</span>
								<i>open_in_new</i>
							</a>

							<span ot-if="isBool && value === true" class="value bool-yes"><i>check_circle</i>Yes</span>
							<span ot-if="isBool && value === false" class="value bool-no"><i>cancel</i>No</span>

							<span ot-if="isCopy" class="value identifier" :ot-click="handleCopy" ot-tooltip="Click to copy">
								<span>{{ formatted }}</span>
								<i>content_copy</i>
							</span>

							<span ot-if="!isLink && !isBool && !isCopy" class="value">{{ formatted }}</span>

							<span ot-if="trendDirection" :class="'trend trend-' + trendDirection">
								<i ot-if="trendDirection === 'up'">trending_up</i>
								<i ot-if="trendDirection === 'down'">trending_down</i>
								{{ trendFormatted }}
							</span>
						</div>

						<e-dashboard-sparkline ot-if="showSparkline" :series="series" :color="color"></e-dashboard-sparkline>

						<div ot-if="sub" class="sub">{{ sub }}</div>
					</div>
				</e-dashboard-widget>
			`;
		}
	});
});
