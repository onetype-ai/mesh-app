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
			const [scriptsList, usageList, serversList] = await Promise.all([
				scripts.Find()
					.filter('package_id', null, 'NULL')
					.sort('created_at', 'desc')
					.limit(1000)
					.many(),
				servers.scripts.Find()
					.limit(5000)
					.many(),
				servers.Find()
					.sort('name', 'asc')
					.limit(1000)
					.many()
			]);

			return {
				items: scriptsList.map((item) => item.GetData()),
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
					{ icon: 'terminal', label: 'Scripts' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data })
			{
				this.items = data.items;

				this.getServers = (script) =>
				{
					return data.usage
						.filter((entry) => entry.script_id === script.id)
						.map((entry) => data.fleet.find((server) => server.id === entry.server_id))
						.filter((server) => !!server);
				};

				this.getTags = (script) =>
				{
					return this.getServers(script).map((server) =>
					{
						return {
							id: server.id,
							label: server.name,
							icon: 'dns',
							color: server.is_connected === true ? 'green' : null
						};
					});
				};

				this.popup = () => '<div style="padding: 16px;">Coming soon…</div>';

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
							<e-script-card ot-for="item in items" :item="item">
								<div ot-if="getTags(item).length" slot="tags">
									<e-global-tags :items="getTags(item)" tone="pills" size="s"></e-global-tags>
								</div>

								<div slot="actions">
									<e-form-button
										text="Edit"
										icon="edit"
										tone="ghost"
										size="s"
										:href="'/creator/scripts/' + item.id"
									></e-form-button>
									<e-form-button
										text="Attach"
										icon="link"
										color="brand"
										tone="soft"
										size="s"
										:ot-popup="popup"
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
