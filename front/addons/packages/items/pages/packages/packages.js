onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'packages',
		route: '/packages',
		title: 'Packages',
		grid:
		{
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function()
		{
			const [packagesList, scriptsList] = await Promise.all([
				packages.Find()
					.sort('created_at', 'desc')
					.limit(1000)
					.many(),
				scripts.Find()
					.select(['id', 'package_id', 'name'])
					.sort('name', 'asc')
					.limit(1000)
					.many()
			]);

			const scriptsByPackage = {};

			for(const script of scriptsList)
			{
				const packageId = script.Get('package_id');

				if(!packageId)
				{
					continue;
				}

				if(!scriptsByPackage[packageId])
				{
					scriptsByPackage[packageId] = [];
				}

				scriptsByPackage[packageId].push(script.data);
			}

			const items = packagesList.map((item) =>
			{
				const data = item.data;
				data.scripts = scriptsByPackage[data.id] || [];
				return data;
			});

			return { items };
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
					{ icon: 'inventory_2', label: 'Packages' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data })
			{
				this.items = data.items;

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Packages"
							description="System-level tools installed on your servers — git, docker, nvidia-driver and more."
							size="m"
						></e-global-heading>

						<e-status-empty
							ot-if="items.length === 0"
							icon="inventory_2"
							title="No packages yet"
							description="Install your first package to manage tools across your fleet."
						></e-status-empty>

						<div ot-if="items.length > 0" class="ot-grid-auto-l">
							<a ot-for="item in items" :href="'/packages/' + item.id">
								<e-package-card :item="item"></e-package-card>
							</a>
						</div>
					</div>
				`;
			}
		}
	});
});
