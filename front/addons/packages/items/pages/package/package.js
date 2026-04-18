onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'package',
		route: '/packages/:id',
		title: 'Package',
		grid:
		{
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function(parameters)
		{
			const [item, scriptsList, serversList] = await Promise.all([
				packages.Find()
					.filter('id', parameters.id)
					.one(),
				scripts.Find()
					.filter('package_id', parameters.id)
					.sort('name', 'asc')
					.limit(100)
					.many(),
				servers.Find()
					.sort('created_at', 'desc')
					.limit(1000)
					.many()
			]);

			return {
				package: item ? item.data : null,
				scripts: scriptsList.map((script) => script.data),
				servers: serversList.map((server) => server.data)
			};
		},
		areas:
		{
			sidebar: function()
			{
				return `<e-dock></e-dock>`;
			},
			navbar: function({ data })
			{
				this.crumbs =
				[
					{ icon: 'inventory_2', label: 'Packages', href: '/packages' },
					{ label: (data.package && data.package.name) || '—' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data })
			{
				this.package = data.package;
				this.scripts = data.scripts;
				this.servers = data.servers;
				this.loading = {};

				/* Metrics schema from any script that declares widgets (usually the status script) */
				this.metrics = [];

				for(const script of this.scripts)
				{
					if(script.metrics && script.metrics.length)
					{
						this.metrics = this.metrics.concat(script.metrics);
					}
				}

				this.isInstalled = (server) =>
				{
					const condition = this.package && this.package.installed_condition;

					if(!condition)
					{
						return false;
					}

					try
					{
						return onetype.Function(condition, { metrics: server.metrics }) === true;
					}
					catch(error)
					{
						return false;
					}
				};

				this.isLoading = (server) =>
				{
					return this.loading[server.id] === true;
				};

				this.refreshServers = async () =>
				{
					const items = await servers.Find()
						.sort('created_at', 'desc')
						.limit(1000)
						.many();

					this.servers = items.map((item) => item.data);
				};

				this.runAction = async (kind, server) =>
				{
					this.loading = { ...this.loading, [server.id]: true };

					try
					{
						const result = await $ot.command('packages:' + kind, {
							server: String(server.id),
							package: String(this.package.id)
						}, true);

						if(result && result.stderr)
						{
							$ot.toast({ type: 'error', message: result.stderr });
						}
						else
						{
							$ot.toast({ type: 'success', message: this.package.name + ' ' + kind + 'ed.' });
						}

						await this.refreshServers();
					}
					catch(error)
					{
						$ot.toast({ type: 'error', message: error.message || 'Action failed.' });
					}
					finally
					{
						this.loading = { ...this.loading, [server.id]: false };
					}
				};

				this.install = ({ server }) => this.runAction('install', server);
				this.uninstall = ({ server }) => this.runAction('uninstall', server);

				return /* html */ `
					<div class="ot-flex-vertical ot-gap-l">
						<e-package-header :item="package" :scripts="scripts"></e-package-header>

						<div class="ot-container-l ot-flex-vertical ot-pb-l">
							<e-global-heading
								title="Servers"
								description="Install or uninstall this package on your machines."
								size="m"
							></e-global-heading>

							<div ot-if="servers.length > 0" class="ot-flex-vertical ot-gap-m">
								<e-server-card ot-for="item in servers" :item="item" :metrics="metrics">
									<div slot="actions">
										<e-form-button
											ot-if="isInstalled(item)"
											text="Uninstall"
											icon="delete"
											color="red"
											tone="soft"
											size="s"
											:loading="isLoading(item)"
											:_click="() => uninstall({ server: item })"
										></e-form-button>
										<e-form-button
											ot-if="!isInstalled(item)"
											text="Install"
											icon="download"
											color="green"
											tone="soft"
											size="s"
											:loading="isLoading(item)"
											:_click="() => install({ server: item })"
										></e-form-button>
									</div>
								</e-server-card>
							</div>
						</div>
					</div>
				`;
			}
		}
	});
});
