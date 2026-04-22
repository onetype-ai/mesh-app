onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'servers',
		route: '/servers',
		title: 'Servers',
		grid:
		{
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
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
					{ icon: 'dns', label: 'Servers' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function()
			{
				this.items = [];

				this.refresh = async () =>
				{
					const items = await servers.Find()
						.sort('created_at', 'desc')
						.limit(1000)
						.many();

					this.items = items.map((item) => item.data);
				};

				this.OnReady(() => 
				{
					this.refresh();
					this.interval = setInterval(this.refresh, 10000);
				});

				this.OnDestroy(() =>
				{
					clearInterval(this.interval);
				});

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Servers"
							description="Machines connected to your Mesh fleet."
							size="m"
						></e-global-heading>

						<e-status-empty
							ot-if="items.length === 0"
							icon="dns"
							title="No servers yet"
							description="Add your first machine to get started."
						></e-status-empty>

						<div ot-if="items.length > 0" class="ot-flex-vertical ot-gap-m">
							<a ot-for="item in items" :href="'/servers/' + item.id">
								<e-server-card :item="item"></e-server-card>
							</a>
						</div>
					</div>
				`;
			}
		}
	});
});
