onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'script-card',
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
				this.platforms = (item.platforms || []).filter((platform) => platform !== '*');
				this.anyPlatform = (item.platforms || []).includes('*');
				this.output = item.output || 'raw';
				this.autorun = item.autorun === true;
				this.loop = item.loop ? (item.loop >= 1000 ? (item.loop / 1000) + 's' : item.loop + 'ms') : null;
				this.metricsCount = (item.metrics || []).length;
				this.scopeLabel = scope.label;
				this.scopeIcon = scope.icon;
				this.scopeColor = scope.color;
			});

			/* ===== RENDER ===== */

			return /* html */ `
				<div class="box">
					<div class="head">
						<div :class="'scope scope-' + scopeColor">
							<i>{{ scopeIcon }}</i>
						</div>
						<div class="head-text">
							<h3 class="name">{{ name }}</h3>
							<div class="scope-label">{{ scopeLabel }}</div>
						</div>
					</div>

					<p ot-if="description" class="description">{{ description }}</p>

					<div class="meta">
						<span ot-if="autorun" class="chip">
							<i>bolt</i>
							Autorun
						</span>
						<span ot-if="loop" class="chip">
							<i>refresh</i>
							{{ loop }}
						</span>
						<span class="chip">
							<i>data_object</i>
							{{ output }}
						</span>
						<span ot-if="metricsCount" class="chip">
							<i>analytics</i>
							{{ metricsCount }} metrics
						</span>
					</div>

					<div class="footer">
						<span ot-if="anyPlatform" class="platform">
							<i>all_inclusive</i>
							All platforms
						</span>
						<span ot-for="platform in platforms" class="platform">
							<i ot-if="platform === 'linux'">lan</i>
							<i ot-if="platform === 'darwin'">laptop_mac</i>
							<span>{{ platform }}</span>
						</span>
					</div>
				</div>
			`;
		}
	});
});
