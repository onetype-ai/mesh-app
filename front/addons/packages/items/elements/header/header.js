onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'package-header',
		config:
		{
			item:
			{
				type: 'object',
				value: null,
				description: 'Package row from packages addon.'
			},
			scripts:
			{
				type: 'array',
				value: [],
				description: 'Scripts belonging to this package.'
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
				this.description = item.description || '';
				this.version = item.version || '';
				this.platforms = (item.platforms || []).filter((platform) => platform !== '*');
				this.anyPlatform = (item.platforms || []).includes('*');
				this.scriptsCount = (this.scripts || []).length;
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
							<span ot-if="version" class="version">{{ version }}</span>
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
							<span ot-if="scriptsCount" class="meta-item">
								<i>terminal</i>
								{{ scriptsCount }} scripts
							</span>
							<span class="meta-item">
								<i>check_circle</i>
								Active on 2 servers
							</span>
						</div>
					</div>
				</div>
			`;
		}
	});
});
