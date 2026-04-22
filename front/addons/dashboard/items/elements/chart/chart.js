onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'dashboard-chart',
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
			size:
			{
				type: 'string',
				value: 'xl',
				options: ['s', 'm', 'l', 'xl']
			},
			series:
			{
				type: 'array',
				value: [],
				description: 'Array of series: [{ label, color, values: [number] }].'
			},
			labels:
			{
				type: 'array',
				value: [],
				each: { type: 'string' },
				description: 'X-axis labels, one per point.'
			},
			height:
			{
				type: 'number',
				value: 220
			},
			unit:
			{
				type: 'string',
				value: ''
			},
			stale:
			{
				type: 'boolean',
				value: false
			}
		},
		render: function()
		{
			this.escape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

			this.shortenNumber = (v) =>
			{
				if(v === null || v === undefined) return '—';
				const abs = Math.abs(v);
				if(abs >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + 'B';
				if(abs >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
				if(abs >= 10_000) return (v / 1_000).toFixed(1) + 'K';
				if(Number.isInteger(v)) return String(v);
				return v.toFixed(abs < 1 ? 2 : 1);
			};

			this.niceNumber = (value) =>
			{
				if(value === 0) return 1;
				const exp = Math.floor(Math.log10(Math.abs(value)));
				const frac = Math.abs(value) / Math.pow(10, exp);
				let nice;
				if(frac <= 1) nice = 1;
				else if(frac <= 2) nice = 2;
				else if(frac <= 5) nice = 5;
				else nice = 10;
				return nice * Math.pow(10, exp);
			};

			this.Compute(() =>
			{
				const series = (this.series || []).map((s) => Object.assign({}, s, { values: (s.values || []).map((v) => (typeof v === 'number' && !isNaN(v)) ? v : null) }));
				const labels = this.labels || [];


				const allValues = series.flatMap((s) => s.values.filter((v) => v !== null));

				if(series.length === 0 || allValues.length === 0)
				{
					this.empty = true;
					return;
				}

				this.empty = false;

				const width = 800;
				const height = this.height;
				const padding = { top: 20, right: 20, bottom: 26, left: 44 };
				const innerWidth = width - padding.left - padding.right;
				const innerHeight = height - padding.top - padding.bottom;

				const min = Math.min(...allValues, 0);
				const max = Math.max(...allValues);
				const range = max - min || 1;

				const niceMax = this.niceNumber(max);
				const niceMin = min < 0 ? this.niceNumber(-min) * -1 : 0;
				const niceRange = niceMax - niceMin || 1;

				/* Grid lines and Y labels */
				const ticks = 4;
				this.gridLines = [];
				for(let t = 0; t <= ticks; t++)
				{
					const value = niceMin + (niceRange * t / ticks);
					const y = padding.top + innerHeight - (innerHeight * t / ticks);
					this.gridLines.push({
						y,
						label: this.shortenNumber(value),
						x1: padding.left,
						x2: padding.left + innerWidth
					});
				}

				/* Per-series paths */
				const pointCount = Math.max(...series.map((s) => s.values.length));
				const step = pointCount > 1 ? innerWidth / (pointCount - 1) : 0;

				this.series = series.map((s) =>
				{
					const pts = s.values.map((v, i) =>
					{
						if(v === null) return null;
						const x = padding.left + i * step;
						const y = padding.top + innerHeight - ((v - niceMin) / niceRange) * innerHeight;
						return [x, y, v];
					});

					let linePath = '';
					let areaPath = '';
					let started = false;

					for(let i = 0; i < pts.length; i++)
					{
						const p = pts[i];
						if(p === null) { started = false; continue; }

						if(!started)
						{
							linePath += (linePath ? ' M ' : 'M ') + p[0] + ' ' + p[1];
							areaPath += (areaPath ? ' M ' : 'M ') + p[0] + ' ' + (padding.top + innerHeight) + ' L ' + p[0] + ' ' + p[1];
							started = true;
							continue;
						}

						const prev = pts[i - 1];
						if(prev === null) continue;

						const cx = (prev[0] + p[0]) / 2;
						linePath += ' C ' + cx + ' ' + prev[1] + ' ' + cx + ' ' + p[1] + ' ' + p[0] + ' ' + p[1];
						areaPath += ' C ' + cx + ' ' + prev[1] + ' ' + cx + ' ' + p[1] + ' ' + p[0] + ' ' + p[1];
					}

					/* Close area to bottom for last run */
					if(pts.length && pts[pts.length - 1] !== null)
					{
						const last = pts[pts.length - 1];
						areaPath += ' L ' + last[0] + ' ' + (padding.top + innerHeight) + ' Z';
					}

					const lastPoint = pts.filter(Boolean).pop();
					const lastValue = s.values.filter((v) => v !== null).pop();

					return {
						label: s.label,
						color: s.color || 'brand',
						linePath,
						areaPath,
						dotX: lastPoint ? lastPoint[0] : 0,
						dotY: lastPoint ? lastPoint[1] : 0,
						hasDot: !!lastPoint,
						current: lastValue
					};
				});

				/* X-axis labels — show every ~6th */
				this.xLabels = [];
				const every = Math.max(1, Math.floor(labels.length / 6));
				for(let i = 0; i < labels.length; i += every)
				{
					this.xLabels.push({
						x: padding.left + i * step,
						y: padding.top + innerHeight + 18,
						label: labels[i]
					});
				}

				const NS = 'http://www.w3.org/2000/svg';
				const svg = document.createElementNS(NS, 'svg');
				svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
				svg.setAttribute('preserveAspectRatio', 'none');
				svg.setAttribute('class', 'chart');

				const el = (tag, attrs) =>
				{
					const node = document.createElementNS(NS, tag);
					for(const [key, val] of Object.entries(attrs))
					{
						node.setAttribute(key, val);
					}
					return node;
				};

				for(const g of this.gridLines)
				{
					svg.appendChild(el('line', { class: 'grid', x1: g.x1, x2: g.x2, y1: g.y, y2: g.y }));
					const txt = el('text', { class: 'grid-label', x: 30, y: g.y + 4 });
					txt.textContent = g.label;
					svg.appendChild(txt);
				}

				for(const s of this.series)
				{
					const group = el('g', { class: 'series accent-' + s.color });
					group.appendChild(el('path', { class: 'area', d: s.areaPath }));
					group.appendChild(el('path', { class: 'line', d: s.linePath }));
					if(s.hasDot)
					{
						group.appendChild(el('circle', { class: 'dot', cx: s.dotX, cy: s.dotY, r: 3 }));
					}
					svg.appendChild(group);
				}

				for(const x of this.xLabels)
				{
					const txt = el('text', { class: 'x-label', x: x.x, y: x.y });
					txt.textContent = x.label;
					svg.appendChild(txt);
				}

				this.svgNode = svg;

				this.legend = series.map((s) =>
				{
					const last = (s.values.filter((v) => v !== null).pop());
					return {
						label: s.label,
						color: s.color || 'brand',
						value: last !== undefined ? this.shortenNumber(last) + (this.unit ? this.unit : '') : '—'
					};
				});
			});

			return /* html */ `
				<e-dashboard-widget
					:label="label"
					:description="description"
					:icon="icon"
					color="neutral"
					:size="size"
					:stale="stale"
				>
					<div slot="body" class="chart-body">
						<div ot-if="!empty" class="legend">
							<span ot-for="item in legend" :class="'legend-item accent-' + item.color">
								<span class="dot"></span>
								<span class="label">{{ item.label }}</span>
								<span class="value">{{ item.value }}</span>
							</span>
						</div>

						<div ot-if="!empty" class="svg-host">
							<div ot-node="svgNode"></div>
						</div>

						<div ot-if="empty" class="empty">
							<i>timeline</i>
							<span>No data yet.</span>
						</div>
					</div>
				</e-dashboard-widget>
			`;
		}
	});
});
