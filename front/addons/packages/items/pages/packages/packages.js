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
			const [packagesList, usageList, serversList] = await Promise.all([
				packages.Find()
					.sort('created_at', 'desc')
					.limit(1000)
					.many(),
				servers.packages.Find()
					.limit(5000)
					.many(),
				servers.Find()
					.sort('name', 'asc')
					.limit(1000)
					.many()
			]);

			return {
				items: packagesList.map((item) => item.GetData()),
				usage: usageList.map((row) => row.GetData()),
				fleet: serversList.map((server) => server.GetData())
			};
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

				this.getServers = (pkg) =>
				{
					return data.usage
						.filter((entry) => entry.package_id === pkg.id)
						.map((entry) => data.fleet.find((server) => server.id === entry.server_id))
						.filter((server) => !!server);
				};

				this.getTags = (pkg) =>
				{
					return this.getServers(pkg).map((server) =>
					{
						return {
							id: server.id,
							label: server.name,
							icon: 'dns',
							color: server.is_connected === true ? 'green' : null
						};
					});
				};

				this.install = async (pkg) =>
				{
					const serverId = await $ot.confirm('Install ' + pkg.name, 'Enter the server ID to install this package on.', {
						icon: 'dns',
						input: true,
						placeholder: 'Server ID…',
						confirm: 'Install',
						cancel: 'Cancel'
					});

					if(!serverId)
					{
						return;
					}

					const { code, message } = await $ot.command('servers:packages:install', {
						server_id: String(serverId).trim(),
						package_id: pkg.id
					}, true);

					if(code !== 200)
					{
						$ot.toast({ message, type: 'error' });
						return;
					}

					$ot.toast({ message: pkg.name + ' installed.', type: 'success' });
				};

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Packages"
							description="System-level tools installed on your servers — git, docker, drivers, language runtimes."
							size="m"
						></e-global-heading>

						<e-status-empty
							ot-if="items.length === 0"
							icon="inventory_2"
							title="No packages yet"
							description="Import your first package from the marketplace."
						></e-status-empty>

						<div ot-if="items.length > 0" class="ot-grid-auto-l">
							<e-package-card ot-for="item in items" :item="item">
								<div ot-if="getTags(item).length" slot="tags">
									<e-global-tags :items="getTags(item)" tone="pills" size="s"></e-global-tags>
								</div>

								<div slot="actions">
									<e-form-button
										text="Edit"
										icon="edit"
										tone="ghost"
										size="s"
										:href="'/creator/packages/' + item.id"
									></e-form-button>
									<e-form-button
										text="Install"
										icon="download"
										color="brand"
										tone="soft"
										size="s"
										:_click="() => install(item)"
									></e-form-button>
								</div>
							</e-package-card>
						</div>
					</div>
				`;
			}
		}
	});
});
