onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'marketplace-services',
		route: '/marketplace',
		title: 'Services — Marketplace',
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
					{ label: 'Services' }
				];

				return /* html */ `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: async function()
			{
				this.items = await services.Find()
					.filter('is_marketplace', true)
					.filter('status', 'Published')
					.join('scripts', 'script_deploy_id', 'script_deploy', (find) => find.select('name'))
					.join('scripts', 'script_start_id', 'script_start', (find) => find.select('name'))
					.join('scripts', 'script_stop_id', 'script_stop', (find) => find.select('name'))
					.join('scripts', 'script_restart_id', 'script_restart', (find) => find.select('name'))
					.join('scripts', 'script_destroy_id', 'script_destroy', (find) => find.select('name'))
					.join('scripts', 'script_status_id', 'script_status', (find) => find.select('name'))
					.sort('name', 'asc')
					.limit(1000)
					.many();

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Services"
							description="Long-running workloads — databases, AI runtimes, web apps. Deploy with one click on any server."
							size="m"
						></e-global-heading>

						<e-marketplace-tabs active="services"></e-marketplace-tabs>

						<e-status-empty
							ot-if="items.length === 0"
							icon="deployed_code"
							title="No services yet"
							description="Verified services from the community will show up here."
						></e-status-empty>

						<div ot-if="items.length > 0" class="ot-grid-auto-m">
							<a ot-for="item in items.map((item) => item.data)" :href="'/marketplace/services/' + item.id">
								<e-service-card :item="item"></e-service-card>
							</a>
						</div>
					</div>
				`;
			}
		}
	});
});
