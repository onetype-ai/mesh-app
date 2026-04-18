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
		data: async function()
		{
			const items = await servers.Find()
				.sort('created_at', 'desc')
				.limit(1000)
				.many();

			return { items: items.map((item) => item.data) };
		},
		onEnter: function()
		{
			// this.interval = setInterval(async () =>
			// {
			// 	const items = await servers.Find()
			// 		.sort('created_at', 'desc')
			// 		.limit(1000)
			// 		.many();

			// 	onetype.Emit('servers.refresh', items.map((item) => item.data));
			// }, 10000);
		},
		onLeave: function()
		{
			// if(this.interval)
			// {
			// 	clearInterval(this.interval);
			// 	this.interval = null;
			// }
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
			main: function({ data })
			{
				this.items = data.items;

				this.On('servers.refresh', (items) =>
				{
					console.log(items);
					this.items = items;
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
							<e-server-card ot-for="item in items" :item="item"></e-server-card>
						</div>
					</div>
				`;
			}
		}
	});
});
