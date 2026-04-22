onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'server-packages',
		route: '/servers/:id/packages',
		title: 'Packages',
		grid:
		{
			template: '"sidebar navbar navbar" "sidebar server main"',
			columns: '68px 260px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function(parameters)
		{
			const [serverItem, itemsList] = await Promise.all([
				servers.Find()
					.filter('id', parameters.id)
					.one(),
				servers.packages.Find()
					.filter('server_id', parameters.id)
					.join('packages', 'package_id', 'package')
					.limit(1000)
					.many()
			]);

			return {
				server: serverItem ? serverItem.GetData() : null,
				items: itemsList.map((row) => row.GetData())
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
					{ icon: 'dns', label: 'Servers', href: '/servers' },
					{ label: data.server && data.server.name ? data.server.name : '—', href: '/servers/' + (data.server ? data.server.id : '') },
					{ label: 'Packages' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			server: function({ data })
			{
				this.server = data.server;

				return `<e-server-sidebar :item="server"></e-server-sidebar>`;
			},
			main: function({ data })
			{
				this.server = data.server;
				this.items = data.items;

				this.handleRemove = async (link) =>
				{
					const confirmed = await $ot.confirm(
						'Uninstall ' + link.package.name,
						'This will run the uninstall script and remove the package from ' + this.server.name + '.',
						{ confirm: 'Uninstall', cancel: 'Cancel', color: 'red' }
					);

					if(!confirmed)
					{
						return;
					}

					await $ot.command('servers:packages:uninstall', {
						server_id: this.server.id,
						package_id: link.package_id
					});

					this.items = this.items.filter((entry) => entry.id !== link.id);
				};

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Packages"
							description="System-level tools installed on this server."
							size="m"
						></e-global-heading>

						<e-status-empty
							ot-if="items.length === 0"
							icon="inventory_2"
							title="No packages"
							description="Install packages on this server from the team library."
						></e-status-empty>

						<div ot-if="items.length > 0" class="ot-grid-auto-l">
							<e-package-card ot-for="link in items" :item="link.package">
								<div slot="actions">
									<e-form-button
										text="Uninstall"
										icon="delete"
										color="red"
										tone="ghost"
										size="s"
										:_click="() => handleRemove(link)"
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
