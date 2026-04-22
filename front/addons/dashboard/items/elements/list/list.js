onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'dashboard-list',
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
				value: 'l',
				options: ['s', 'm', 'l', 'xl']
			},
			columns:
			{
				type: 'array',
				value: [],
				description: 'Array of { key, label, type, unit, width } column definitions.'
			},
			items:
			{
				type: 'array',
				value: []
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
				const columns = this.columns || [];
				const items = this.items || [];

				this.hasItems = items.length > 0;

				this.rows = items.map((item, index) =>
				{
					return {
						index,
						cells: columns.map((col) =>
						{
							const raw = item[col.key];
							const value = dashboard.Fn('format.value', col.type || 'text', raw, col.unit);
							return {
								value,
								align: col.align || 'left',
								type: col.type || 'text'
							};
						})
					};
				});

				this.headers = columns.map((col) =>
				{
					return {
						label: col.label || col.key,
						align: col.align || 'left',
						width: col.width || ''
					};
				});

				this.gridTemplate = columns.map((col) => col.width || '1fr').join(' ');
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
					<div slot="body">
						<div ot-if="hasItems" class="table">
							<div class="thead" :style="'grid-template-columns: ' + gridTemplate">
								<div ot-for="h in headers" :class="'th align-' + h.align">{{ h.label }}</div>
							</div>
							<div ot-for="row in rows" class="tr" :style="'grid-template-columns: ' + gridTemplate">
								<div ot-for="cell in row.cells" :class="'td align-' + cell.align + ' type-' + cell.type">{{ cell.value }}</div>
							</div>
						</div>
						<div ot-if="!hasItems" class="empty">
							<i>inbox</i>
							<span>No items.</span>
						</div>
					</div>
				</e-dashboard-widget>
			`;
		}
	});
});
