onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'dashboard-matrix',
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
				value: 'grid_view'
			},
			kind:
			{
				type: 'string',
				value: 'packages',
				options: ['packages', 'services'],
				description: 'What kind of items this matrix represents.'
			},
			items:
			{
				type: 'array',
				value: [],
				description: 'Rows: [{ id, name, slug, icon, color }].'
			},
			servers:
			{
				type: 'array',
				value: [],
				description: 'Columns: [{ id, name, status }].'
			},
			cells:
			{
				type: 'array',
				value: [],
				description: 'Grid data: [{ item_id, server_id, state, stats: [{ label, value }] }].'
			}
		},
		render: function()
		{
			this.Compute(() =>
			{
				const items = this.items || [];
				const servers = this.servers || [];
				const cells = this.cells || [];

				this.hasRows = items.length > 0 && servers.length > 0;

				/* Map lookup: item_id → server_id → cell */
				const lookup = {};
				for(const cell of cells)
				{
					if(!lookup[cell.item_id]) lookup[cell.item_id] = {};
					lookup[cell.item_id][cell.server_id] = cell;
				}

				const stateMap =
				{
					running:      { label: 'Running',       color: 'green',   icon: 'check_circle' },
					deployed:     { label: 'Deployed',      color: 'blue',    icon: 'inventory_2' },
					installed:    { label: 'Installed',     color: 'blue',    icon: 'inventory_2' },
					stopped:      { label: 'Stopped',       color: 'orange',  icon: 'pause_circle' },
					failing:      { label: 'Failing',       color: 'red',     icon: 'error' },
					missing:      { label: 'Not installed', color: 'neutral', icon: 'radio_button_unchecked' },
					unavailable:  { label: 'Unavailable',   color: 'neutral', icon: 'offline_bolt' }
				};

				this.rows = items.map((item) =>
				{
					const perServer = servers.map((srv) =>
					{
						const cell = (lookup[item.id] && lookup[item.id][srv.id]) || { state: 'missing', stats: [] };
						const state = stateMap[cell.state] || stateMap.missing;

						const tooltipLines = [ srv.name + ' · ' + state.label ];

						for(const stat of (cell.stats || []))
						{
							tooltipLines.push(stat.label + ': ' + stat.value);
						}

						return {
							serverId: srv.id,
							serverName: srv.name,
							state: cell.state || 'missing',
							label: state.label,
							color: state.color,
							icon: state.icon,
							primary: (cell.stats && cell.stats[0]) ? cell.stats[0].value : '',
							tooltip: tooltipLines.join('\n')
						};
					});

					const counts = {
						running: perServer.filter((p) => p.state === 'running').length,
						deployed: perServer.filter((p) => p.state === 'deployed' || p.state === 'installed').length,
						stopped: perServer.filter((p) => p.state === 'stopped' || p.state === 'failing').length,
						missing: perServer.filter((p) => p.state === 'missing' || p.state === 'unavailable').length
					};

					return {
						id: item.id,
						name: item.name,
						slug: item.slug || '',
						icon: item.icon || (this.kind === 'services' ? 'deployed_code' : 'inventory_2'),
						color: item.color || 'brand',
						cells: perServer,
						summary: counts
					};
				});

				this.serverHeaders = servers.map((srv) =>
				{
					return {
						id: srv.id,
						name: srv.name,
						status: srv.status || 'Inactive',
						statusColor: srv.status === 'Active' ? 'green' : 'orange'
					};
				});

				this.gridTemplate = 'minmax(220px, 260px) repeat(' + servers.length + ', minmax(96px, 1fr)) minmax(140px, 160px)';
			});

			return /* html */ `
				<e-dashboard-widget
					:label="label"
					:description="description"
					:icon="icon"
					color="neutral"
					size="xl"
				>
					<div slot="body" class="matrix">
						<div ot-if="hasRows" class="scroll">
							<div class="thead" :style="'grid-template-columns: ' + gridTemplate">
								<div class="th th-item">Item</div>
								<div ot-for="h in serverHeaders" class="th th-server">
									<span class="srv-name">{{ h.name }}</span>
									<span :class="'srv-status status-' + h.statusColor">
										<span class="pulse"></span>
										{{ h.status }}
									</span>
								</div>
								<div class="th th-summary">Coverage</div>
							</div>

							<div ot-for="row in rows" class="tr" :style="'grid-template-columns: ' + gridTemplate">
								<div class="td td-item">
									<div :class="'icon-box accent-' + row.color"><i>{{ row.icon }}</i></div>
									<div class="item-text">
										<div class="item-name">{{ row.name }}</div>
										<div ot-if="row.slug" class="item-slug">{{ row.slug }}</div>
									</div>
								</div>

								<div ot-for="cell in row.cells" :class="'td td-cell state-' + cell.color" :ot-tooltip="{ text: cell.tooltip, position: { x: 'center', y: 'top' } }">
									<i class="cell-icon">{{ cell.icon }}</i>
									<span ot-if="cell.primary" class="cell-primary">{{ cell.primary }}</span>
									<span ot-if="!cell.primary" class="cell-label">{{ cell.label }}</span>
								</div>

								<div class="td td-summary">
									<span ot-if="row.summary.running > 0" class="chip chip-green">{{ row.summary.running }}<i>check_circle</i></span>
									<span ot-if="row.summary.deployed > 0" class="chip chip-blue">{{ row.summary.deployed }}<i>inventory_2</i></span>
									<span ot-if="row.summary.stopped > 0" class="chip chip-orange">{{ row.summary.stopped }}<i>pause_circle</i></span>
									<span ot-if="row.summary.missing > 0" class="chip chip-neutral">{{ row.summary.missing }}<i>remove</i></span>
								</div>
							</div>
						</div>

						<div ot-if="!hasRows" class="empty">
							<i>grid_view</i>
							<span>No items to display.</span>
						</div>
					</div>
				</e-dashboard-widget>
			`;
		}
	});
});
