onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'package-card',
		config:
		{
			item:
			{
				type: 'object',
				value: null,
				description: 'Package row from packages addon.'
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
						: { label: 'Team', icon: 'group', color: 'orange' };

				this.name = item.name || '—';
				this.version = item.version || '';
				this.description = item.description || '';
				this.scripts = item.scripts || [];
				this.platforms = (item.platforms || []).filter((platform) => platform !== '*');
				this.anyPlatform = (item.platforms || []).includes('*');
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
						<span ot-if="version" class="version">{{ version }}</span>
					</div>

					<p ot-if="description" class="description">{{ description }}</p>

					<div ot-if="scripts.length" class="scripts">
						<span ot-for="script in scripts" class="script">
							<i>terminal</i>
							{{ script.name }}
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
