onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'server-services',
		route: '/servers/:id/services',
		title: 'Services',
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
				servers.services.Find()
					.filter('server_id', parameters.id)
					.join('services', 'service_id', 'service')
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
					{ label: 'Services' }
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

				this.handleStart = async (link) =>
				{
					await $ot.command('servers:services:start', {
						server_id: this.server.id,
						service_id: link.service_id
					});
				};

				this.handleStop = async (link) =>
				{
					await $ot.command('servers:services:stop', {
						server_id: this.server.id,
						service_id: link.service_id
					});
				};

				this.handleRestart = async (link) =>
				{
					await $ot.command('servers:services:restart', {
						server_id: this.server.id,
						service_id: link.service_id
					});
				};

				this.handleRemove = async (link) =>
				{
					const confirmed = await $ot.confirm(
						'Destroy ' + link.service.name,
						'This will stop the container and remove it from ' + this.server.name + ' along with its data.',
						{ confirm: 'Destroy', cancel: 'Cancel', color: 'red' }
					);

					if(!confirmed)
					{
						return;
					}

					await $ot.command('servers:services:destroy', {
						server_id: this.server.id,
						service_id: link.service_id
					});

					this.items = this.items.filter((entry) => entry.id !== link.id);
				};

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Services"
							description="Long-running workloads deployed on this server."
							size="m"
						></e-global-heading>

						<e-status-empty
							ot-if="items.length === 0"
							icon="deployed_code"
							title="No services"
							description="Deploy services to this server from the team library."
						></e-status-empty>

						<div ot-if="items.length > 0" class="ot-grid-auto-l">
							<e-service-card ot-for="link in items" :item="link.service">
								<div slot="actions">
									<e-form-button
										text="Start"
										icon="play_arrow"
										color="green"
										tone="ghost"
										size="s"
										:_click="() => handleStart(link)"
									></e-form-button>
									<e-form-button
										text="Stop"
										icon="stop"
										color="orange"
										tone="ghost"
										size="s"
										:_click="() => handleStop(link)"
									></e-form-button>
									<e-form-button
										text="Restart"
										icon="restart_alt"
										color="blue"
										tone="ghost"
										size="s"
										:_click="() => handleRestart(link)"
									></e-form-button>
									<e-form-button
										text="Destroy"
										icon="delete"
										color="red"
										tone="ghost"
										size="s"
										:_click="() => handleRemove(link)"
									></e-form-button>
								</div>
							</e-service-card>
						</div>
					</div>
				`;
			}
		}
	});
});
