onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'server-logs',
		route: '/servers/:id/logs',
		title: 'Logs',
		grid:
		{
			template: '"sidebar navbar navbar" "sidebar server main"',
			columns: '68px 260px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function(parameters)
		{
			const item = await servers.Find()
				.filter('id', parameters.id)
				.one();

			return { server: item ? item.data : null };
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
					{ label: 'Logs' }
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

				return `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Logs"
							description="Every event that touches this server — agent connects, script runs, install actions, system changes."
							size="m"
						></e-global-heading>

						<e-logs :server="server.id"></e-logs>
					</div>
				`;
			}
		}
	});
});
