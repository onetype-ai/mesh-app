onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'marketplace-scripts',
		route: '/marketplace/scripts',
		title: 'Scripts — Marketplace',
		grid:
		{
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		areas:
		{
			sidebar: function()
			{
				return /* html */ `<e-dock></e-dock>`;
			},
			navbar: function()
			{
				this.crumbs =
				[
					{ icon: 'storefront', label: 'Marketplace', href: '/marketplace' },
					{ label: 'Scripts' }
				];

				return /* html */ `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: async function()
			{
				this.items = await scripts.Find()
					.filter('is_marketplace', true)
					.filter('status', 'Published')
					.sort('name', 'asc')
					.limit(1000)
					.many();

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Scripts"
							description="Bash recipes for metrics, security checks, and automation — reusable building blocks."
							size="m"
						></e-global-heading>

						<e-marketplace-tabs active="scripts"></e-marketplace-tabs>

						<e-status-empty
							ot-if="items.length === 0"
							icon="terminal"
							title="No scripts yet"
							description="Verified scripts from the community will show up here."
						></e-status-empty>

						<div ot-if="items.length > 0" class="ot-grid-auto-m">
							<a ot-for="item in items.map((item) => item.data)" :href="'/marketplace/scripts/' + item.id">
								<e-script-card :item="item"></e-script-card>
							</a>
						</div>
					</div>
				`;
			}
		}
	});
});
