onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'dashboard-histogram',
		config:
		{
			label:
			{
				type: 'string',
				value: ''
			},
			description:
			{
				type: 'string',
				value: ''
			},
			icon:
			{
				type: 'string',
				value: ''
			},
			color:
			{
				type: 'string',
				value: 'brand'
			},
			size:
			{
				type: 'string',
				value: 'l',
				options: ['s', 'm', 'l', 'xl']
			},
			value:
			{
				type: 'object',
				value: null,
				description: '{ buckets: [{ le, count }], sum, count }.'
			},
			unit:
			{
				type: 'string',
				value: 'ms'
			},
			stale:
			{
				type: 'boolean',
				value: false
			}
		},
		render: function()
		{
			this.Compute(() =>
			{
				const value = this.value || {};
				const buckets = Array.isArray(value.buckets) ? value.buckets.slice().sort((a, b) => a.le - b.le) : [];

				this.empty = buckets.length === 0;

				if(this.empty)
				{
					return;
				}

				/* Bucket counts are cumulative in Prometheus — convert to per-bucket */
				const perBucket = [];
				for(let i = 0; i < buckets.length; i++)
				{
					const prev = i === 0 ? 0 : buckets[i - 1].count;
					perBucket.push({
						le: buckets[i].le,
						count: Math.max(0, buckets[i].count - prev)
					});
				}

				const maxCount = Math.max(1, ...perBucket.map((b) => b.count));

				this.bars = perBucket.map((b) =>
				{
					return {
						le: b.le,
						count: b.count,
						height: Math.max(2, Math.round((b.count / maxCount) * 100)),
						label: b.le >= 1000 ? (b.le / 1000).toFixed(1) + 'k' : String(b.le)
					};
				});

				const total = Number(value.count) || 0;
				const sum = Number(value.sum) || 0;
				const avg = total > 0 ? sum / total : 0;

				this.avg = avg.toFixed(1) + (this.unit ? ' ' + this.unit : '');
				this.total = total;

				/* Quantiles from cumulative buckets */
				const q = (p) =>
				{
					const target = p * total;
					let found = buckets[buckets.length - 1]?.le ?? 0;
					for(const b of buckets)
					{
						if(b.count >= target)
						{
							found = b.le;
							break;
						}
					}
					return found;
				};

				if(total > 0)
				{
					this.p50 = q(0.50).toFixed(0) + (this.unit ? ' ' + this.unit : '');
					this.p95 = q(0.95).toFixed(0) + (this.unit ? ' ' + this.unit : '');
					this.p99 = q(0.99).toFixed(0) + (this.unit ? ' ' + this.unit : '');
				}
				else
				{
					this.p50 = '—';
					this.p95 = '—';
					this.p99 = '—';
				}
			});

			return /* html */ `
				<e-dashboard-widget
					:label="label"
					:description="description"
					:icon="icon"
					:color="color"
					:size="size"
					:stale="stale"
				>
					<div slot="body">
						<div ot-if="!empty" class="hist-body">
							<div class="quantiles">
								<div class="q"><span class="q-label">p50</span><span class="q-value">{{ p50 }}</span></div>
								<div class="q"><span class="q-label">p95</span><span class="q-value">{{ p95 }}</span></div>
								<div class="q"><span class="q-label">p99</span><span class="q-value">{{ p99 }}</span></div>
								<div class="q"><span class="q-label">avg</span><span class="q-value">{{ avg }}</span></div>
							</div>
							<div :class="'bars accent-' + color">
								<div ot-for="bar in bars" class="bar-wrap">
									<div class="bar" :style="'height: ' + bar.height + '%'" :ot-tooltip="{ text: bar.count + ' samples ≤ ' + bar.label + ' ' + unit, position: { x: 'center', y: 'top' } }"></div>
									<div class="bar-label">{{ bar.label }}</div>
								</div>
							</div>
						</div>
						<div ot-if="empty" class="empty">
							<i>bar_chart</i>
							<span>No histogram data.</span>
						</div>
					</div>
				</e-dashboard-widget>
			`;
		}
	});
});
