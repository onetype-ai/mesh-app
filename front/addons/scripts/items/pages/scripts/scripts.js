onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'scripts',
		route: '/scripts',
		title: 'Scripts',
		grid:
		{
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function()
		{
			const items = await scripts.Find()
				.filter('package_id', null, 'NULL')
				.sort('created_at', 'desc')
				.limit(1000)
				.many();

			return { items: items.map((item) => item.data) };
		},
		areas:
		{
			sidebar: function()
			{
				return `<e-dock></e-dock>`;
			},
			navbar: function()
			{
				this.crumbs =
				[
					{ icon: 'terminal', label: 'Scripts' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data })
			{
				this.items = data.items;

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Scripts"
							description="Bash recipes that run on your servers — collect metrics, deploy services, react to events."
							size="m"
						></e-global-heading>

						<e-status-empty
							ot-if="items.length === 0"
							icon="terminal"
							title="No scripts yet"
							description="Create your first script or install one from the marketplace."
						></e-status-empty>

						<div ot-if="items.length > 0" class="ot-grid-auto-l">
							<a ot-for="item in items" :href="'/scripts/' + item.id">
								<e-script-card :item="item"></e-script-card>
							</a>
						</div>
					</div>
				`;
			}
		}
	});
});
