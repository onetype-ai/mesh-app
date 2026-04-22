onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'dashboard-sparkline',
		config:
		{
			series:
			{
				type: 'array',
				value: [],
				each: { type: 'number' }
			},
			color:
			{
				type: 'string',
				value: 'brand',
				options: ['brand', 'blue', 'green', 'orange', 'red', 'neutral']
			},
			height:
			{
				type: 'number',
				value: 36
			}
		},
		render: function()
		{
			this.Compute(() =>
			{
				const series = (this.series || []).filter((v) => typeof v === 'number' && !isNaN(v));

				if(series.length < 2)
				{
					this.svg = '';
					return;
				}

				const width = 200;
				const height = this.height;
				const min = Math.min(...series);
				const max = Math.max(...series);
				const range = max - min || 1;

				const step = width / (series.length - 1);

				const points = series.map((v, i) =>
				{
					const x = i * step;
					const y = height - ((v - min) / range) * height;
					return [x, y];
				});

				let linePath = 'M ' + points[0][0] + ' ' + points[0][1];
				let areaPath = 'M ' + points[0][0] + ' ' + height + ' L ' + points[0][0] + ' ' + points[0][1];

				for(let i = 1; i < points.length; i++)
				{
					const [x, y] = points[i];
					const [px, py] = points[i - 1];
					const cx = (px + x) / 2;
					linePath += ' C ' + cx + ' ' + py + ' ' + cx + ' ' + y + ' ' + x + ' ' + y;
					areaPath += ' C ' + cx + ' ' + py + ' ' + cx + ' ' + y + ' ' + x + ' ' + y;
				}

				areaPath += ' L ' + points[points.length - 1][0] + ' ' + height + ' Z';

				const last = points[points.length - 1];

				const NS = 'http://www.w3.org/2000/svg';
				const svg = document.createElementNS(NS, 'svg');
				svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
				svg.setAttribute('preserveAspectRatio', 'none');
				svg.setAttribute('class', 'chart');

				const area = document.createElementNS(NS, 'path');
				area.setAttribute('class', 'area');
				area.setAttribute('d', areaPath);
				svg.appendChild(area);

				const line = document.createElementNS(NS, 'path');
				line.setAttribute('class', 'line');
				line.setAttribute('d', linePath);
				svg.appendChild(line);

				const dot = document.createElementNS(NS, 'circle');
				dot.setAttribute('class', 'dot');
				dot.setAttribute('cx', last[0]);
				dot.setAttribute('cy', last[1]);
				dot.setAttribute('r', '2');
				svg.appendChild(dot);

				this.svgNode = svg;
				this.svg = 'ok';
			});

			return /* html */ `
				<div :class="'spark accent-' + color" ot-if="svg">
					<div ot-node="svgNode"></div>
				</div>
			`;
		}
	});
});
