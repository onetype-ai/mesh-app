onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'packages',
		route: '/packages',
		title: 'Packages',
		grid:
		{
			template: '"sidebar navbar" "sidebar main" "sidebar terminal"',
			columns: '68px 1fr',
			rows: 'auto 1fr 300px',
			gap: '0'
		},
		data: async function()
		{
			const [list, usage, fleet] = await Promise.all([
				packages.Find().sort('created_at', 'desc').limit(1000).many(),
				servers.packages.Find().limit(5000).many(),
				servers.Find().sort('name', 'asc').limit(1000).many()
			]);

			return {
				items: list.map((item) => item.GetData()),
				usage: usage.map((row) => row.GetData()),
				fleet: fleet.map((server) => server.GetData())
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
				this.crumbs = [{ icon: 'inventory_2', label: 'Packages' }];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data })
			{
				this.items     = data.items;
				this.installing = false;

				this.servers = (pkg) =>
				{
					return data.usage
						.filter((entry) => entry.package_id === pkg.id)
						.map((entry) => data.fleet.find((server) => server.id === entry.server_id))
						.filter(Boolean);
				};

				this.tags = (pkg) =>
				{
					return this.servers(pkg).map((server) => ({
						id:    server.id,
						label: server.name,
						icon:  'dns',
						color: server.is_connected ? 'green' : null
					}));
				};

				this.install = async (pkg) =>
				{
					if(this.installing)
					{
						return;
					}

					const answer = await $ot.confirm('Install ' + pkg.name, 'Enter the server ID to install this package on.', {
						icon:        'dns',
						input:       true,
						placeholder: 'Server ID…',
						confirm:     'Install',
						cancel:      'Cancel'
					});

					if(!answer)
					{
						return;
					}

					const server = String(answer).trim();

					this.installing = true;
					this.Emit('packages.terminal.open', { server });

					try
					{
						const { code, message } = await $ot.command('servers:packages:install', {
							server_id:  server,
							package_id: pkg.id
						}, true);

						if(code !== 200)
						{
							$ot.toast({ message, type: 'error' });
							return;
						}

						$ot.toast({ message: pkg.name + ' installed.', type: 'success' });
					}
					finally
					{
						this.installing = false;
						setTimeout(() => this.Emit('packages.terminal.close'), 10000);
					}
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
								<div ot-if="tags(item).length" slot="tags">
									<e-global-tags :items="tags(item)" tone="pills" size="s"></e-global-tags>
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
										:loading="installing"
										:_click="() => install(item)"
									></e-form-button>
								</div>
							</e-package-card>
						</div>
					</div>
				`;
			},
			terminal: function()
			{
				this.server = '';

				this.On('packages.terminal.open', ({ server }) =>
				{
					this.server = server;
				});

				this.On('packages.terminal.close', () =>
				{
					this.server = '';
				});

				return /* html */ `
					<e-terminal :server="server" :readonly="true" :empty="true" background="bg-2" :variant="['border-top']"></e-terminal>
				`;
			}
		}
	});
});
