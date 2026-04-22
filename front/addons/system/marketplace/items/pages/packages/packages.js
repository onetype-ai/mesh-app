onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'marketplace-packages',
		route: '/marketplace/packages',
		title: 'Packages — Marketplace',
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
					{ label: 'Packages' }
				];

				return /* html */ `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: async function()
			{
				this.items = await packages.Find()
					.filter('is_marketplace', true)
					.filter('status', 'Published')
					.join('scripts', 'script_install_id', 'script_install', (find) => find.select('name'))
					.join('scripts', 'script_uninstall_id', 'script_uninstall', (find) => find.select('name'))
					.join('scripts', 'script_status_id', 'script_status', (find) => find.select('name'))
					.sort('name', 'asc')
					.limit(1000)
					.many();

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Packages"
							description="System-level tools installed via one-click — Docker, Git, drivers, language runtimes."
							size="m"
						></e-global-heading>

						<e-marketplace-tabs active="packages"></e-marketplace-tabs>

						<e-status-empty
							ot-if="items.length === 0"
							icon="inventory_2"
							title="No packages yet"
							description="Verified packages from the community will show up here."
						></e-status-empty>

						<div ot-if="items.length > 0" class="ot-grid-auto-m">
							<a ot-for="item in items.map((item) => item.data)" :href="'/marketplace/packages/' + item.id">
								<e-package-card :item="item"></e-package-card>
							</a>
						</div>
					</div>
				`;
			}
		}
	});
});
