onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'dashboard-gauge',
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
				value: 'm',
				options: ['s', 'm', 'l', 'xl']
			},
			value:
			{
				type: 'number',
				value: null
			},
			min:
			{
				type: 'number',
				value: 0
			},
			max:
			{
				type: 'number',
				value: 100
			},
			unit:
			{
				type: 'string',
				value: '%'
			},
			thresholds:
			{
				type: 'array',
				value: []
			},
			sub:
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
			const dashboard = onetype.Addon('dashboard');

			this.Compute(() =>
			{
				const thresholds = (this.thresholds && this.thresholds.length) ? this.thresholds : dashboard.Fn('threshold.default', 'percent');

				const safeValue = (this.value === null || this.value === undefined || isNaN(this.value)) ? 0 : Number(this.value);
				const clamped = Math.max(this.min, Math.min(this.max, safeValue));
				const ratio = (clamped - this.min) / (this.max - this.min || 1);

				this.color = dashboard.Fn('threshold.color', safeValue, thresholds);
				this.hasValue = this.value !== null && this.value !== undefined;

				this.formatted = this.hasValue
					? (Number.isInteger(safeValue) ? String(safeValue) : safeValue.toFixed(1))
					: '—';

				this.unitLabel = this.unit || '';

				/* Arc geometry */
				const radius = 54;
				const circumference = 2 * Math.PI * radius;
				const arcLength = 0.75 * circumference; /* 270deg arc */

				const NS = 'http://www.w3.org/2000/svg';
				const svg = document.createElementNS(NS, 'svg');
				svg.setAttribute('viewBox', '0 0 140 140');
				svg.setAttribute('class', 'ring');

				const track = document.createElementNS(NS, 'circle');
				track.setAttribute('cx', '70');
				track.setAttribute('cy', '70');
				track.setAttribute('r', '54');
				track.setAttribute('class', 'track');
				track.setAttribute('stroke-dasharray', circumference);
				track.setAttribute('stroke-dashoffset', circumference - arcLength);
				svg.appendChild(track);

				const fill = document.createElementNS(NS, 'circle');
				fill.setAttribute('cx', '70');
				fill.setAttribute('cy', '70');
				fill.setAttribute('r', '54');
				fill.setAttribute('class', 'fill');
				fill.setAttribute('stroke-dasharray', circumference);
				fill.setAttribute('stroke-dashoffset', circumference - (arcLength * ratio));
				svg.appendChild(fill);

				this.svgNode = svg;
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
					<div slot="body" class="gauge-body">
						<div :class="'dial accent-' + color">
							<div ot-node="svgNode"></div>
							<div class="readout">
								<div class="number">{{ formatted }}<span ot-if="unitLabel" class="unit">{{ unitLabel }}</span></div>
							</div>
						</div>
						<div ot-if="sub" class="sub">{{ sub }}</div>
					</div>
				</e-dashboard-widget>
			`;
		}
	});
});
