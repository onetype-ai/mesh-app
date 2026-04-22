onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'server-setup',
		route: '/servers/:id/setup',
		title: 'Setup',
		grid:
		{
			template: '"sidebar navbar navbar" "sidebar server main"',
			columns: '68px 260px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function(parameters)
		{
			const [serverItem, gatewaysItems] = await Promise.all([
				servers.Find()
					.filter('id', parameters.id)
					.one(),
				gateways.Find()
					.filter('status', 'Active')
					.sort('name', 'asc')
					.limit(100)
					.many()
			]);

			if(!serverItem)
			{
				return $ot.page('/404');
			}

			return { server: serverItem.GetData(), gateways: gatewaysItems.map((item) => item.data) };
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
					{ label: (data.server && data.server.name) || '—', href: '/servers/' + (data.server && data.server.id) },
					{ label: 'Setup' }
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
				this.gateways = data.gateways;

				return `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Setup"
							description="Connect an agent to this server and pick a gateway. Copy the install command to the target machine."
							size="m"
						></e-global-heading>

						<e-server-setup :item="server" :gateways="gateways"></e-server-setup>
					</div>
				`;
			}
		}
	});
});
