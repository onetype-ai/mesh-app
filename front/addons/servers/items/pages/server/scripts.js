onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'server-scripts',
		route: '/servers/:id/scripts',
		title: 'Scripts',
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
				servers.scripts.Find()
					.filter('server_id', parameters.id)
					.join('scripts', 'script_id', 'script')
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
					{ label: 'Scripts' }
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
						'Detach ' + link.script.name,
						'This script will no longer run on ' + this.server.name + '. It stays in your library and can be attached again anytime.',
						{ confirm: 'Detach', cancel: 'Cancel', color: 'red' }
					);

					if(!confirmed)
					{
						return;
					}

					await $ot.command('servers:scripts:detach', {
						server_id: this.server.id,
						script_id: link.script_id
					});

					this.items = this.items.filter((entry) => entry.id !== link.id);
				};

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Scripts"
							description="Scripts installed on this server — run on connect, on their loop, or on demand."
							size="m"
						></e-global-heading>

						<e-status-empty
							ot-if="items.length === 0"
							icon="terminal"
							title="No scripts"
							description="Add scripts to this server from the team library."
						></e-status-empty>

						<div ot-if="items.length > 0" class="ot-grid-auto-l">
							<e-script-card ot-for="link in items" :item="link.script">
								<div slot="actions">
									<e-form-button
										text="Detach"
										icon="link_off"
										color="red"
										tone="ghost"
										size="s"
										:_click="() => handleRemove(link)"
									></e-form-button>
								</div>
							</e-script-card>
						</div>
					</div>
				`;
			}
		}
	});
});
