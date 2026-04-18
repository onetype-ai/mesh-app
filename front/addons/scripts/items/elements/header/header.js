onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'script-header',
		config:
		{
			item:
			{
				type: 'object',
				value: null,
				description: 'Script row from scripts addon.'
			}
		},
		render: function()
		{
			/* ===== DERIVED ===== */

			this.Compute(() =>
			{
				const item = this.item || {};

				const scope = item.is_global
					? { label: 'Global', icon: 'public', color: 'brand' }
					: item.is_marketplace
						? { label: 'Marketplace', icon: 'storefront', color: 'blue' }
						: item.service_id
							? { label: 'Service', icon: 'deployed_code', color: 'orange' }
							: item.server_id
								? { label: 'Server', icon: 'dns', color: 'green' }
								: { label: 'Team', icon: 'group', color: 'orange' };

				this.name = item.name || '—';
				this.description = item.description || '';
				this.output = item.output || 'raw';
				this.autorun = item.autorun === true;
				this.loop = item.loop ? (item.loop >= 1000 ? (item.loop / 1000) + 's' : item.loop + 'ms') : null;
				this.metricsCount = (item.metrics || []).length;
				this.platforms = (item.platforms || []).filter((platform) => platform !== '*');
				this.anyPlatform = (item.platforms || []).includes('*');
				this.scopeLabel = scope.label;
				this.scopeIcon = scope.icon;
				this.scopeColor = scope.color;
			});

			/* ===== RENDER ===== */

			return /* html */ `
				<div :class="'box accent-' + scopeColor">
					<div class="aurora"></div>
					<div class="grid"></div>

					<div class="body">
						<span :class="'eyebrow eyebrow-' + scopeColor">
							<i>{{ scopeIcon }}</i>
							{{ scopeLabel }}
						</span>

						<h1 class="name">
							<span>{{ name }}</span>
							<span class="output">{{ output }}</span>
						</h1>

						<p ot-if="description" class="description">{{ description }}</p>

						<div class="meta">
							<span ot-if="anyPlatform" class="meta-item">
								<i>all_inclusive</i>
								All platforms
							</span>
							<span ot-for="platform in platforms" class="meta-item">
								<i ot-if="platform === 'linux'">lan</i>
								<i ot-if="platform === 'darwin'">laptop_mac</i>
								<span>{{ platform }}</span>
							</span>
							<span ot-if="autorun" class="meta-item">
								<i>bolt</i>
								Autorun
							</span>
							<span ot-if="loop" class="meta-item">
								<i>refresh</i>
								Every {{ loop }}
							</span>
							<span ot-if="metricsCount" class="meta-item">
								<i>analytics</i>
								{{ metricsCount }} metrics
							</span>
						</div>
					</div>
				</div>
			`;
		}
	});
});
