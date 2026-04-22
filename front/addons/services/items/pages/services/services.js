onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'services',
		route: '/services',
		title: 'Services',
		grid:
		{
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function()
		{
			const [servicesList, usageList, serversList] = await Promise.all([
				services.Find()
					.sort('created_at', 'desc')
					.limit(1000)
					.many(),
				servers.services.Find()
					.limit(5000)
					.many(),
				servers.Find()
					.sort('name', 'asc')
					.limit(1000)
					.many()
			]);

			return {
				items: servicesList.map((item) => item.GetData()),
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
					{ icon: 'deployed_code', label: 'Services' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data })
			{
				this.items = data.items;

				this.getServers = (service) =>
				{
					return data.usage
						.filter((entry) => entry.service_id === service.id)
						.map((entry) => data.fleet.find((server) => server.id === entry.server_id))
						.filter((server) => !!server);
				};

				this.getTags = (service) =>
				{
					return this.getServers(service).map((server) =>
					{
						return {
							id: server.id,
							label: server.name,
							icon: 'dns',
							color: server.status === 'Active' ? 'green' : null
						};
					});
				};

				this.popup = () => '<div style="padding: 16px;">Coming soon…</div>';

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Services"
							description="Long-running workloads deployed on your servers — databases, AI runtimes, web apps."
							size="m"
						></e-global-heading>

						<e-status-empty
							ot-if="items.length === 0"
							icon="deployed_code"
							title="No services yet"
							description="Import your first service from the marketplace."
						></e-status-empty>

						<div ot-if="items.length > 0" class="ot-grid-auto-l">
							<e-service-card ot-for="item in items" :item="item">
								<div ot-if="getTags(item).length" slot="tags">
									<e-global-tags :items="getTags(item)" tone="pills" size="s"></e-global-tags>
								</div>

								<div slot="actions">
									<e-form-button
										text="Edit"
										icon="edit"
										tone="ghost"
										size="s"
										:href="'/creator/services/' + item.id"
									></e-form-button>
									<e-form-button
										text="Deploy"
										icon="rocket_launch"
										color="brand"
										tone="soft"
										size="s"
										:ot-popup="popup"
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
