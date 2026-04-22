onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'server-dashboard',
		route: '/servers/:id',
		title: 'Server',
		grid:
		{
			template: '"sidebar navbar navbar" "sidebar server main"',
			columns: '68px 260px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function(parameters)
		{
			const item = await servers.Find().filter('id', parameters.id).one();

			if(!item)
			{
				return $ot.page('/404');
			}

			return { server: item.GetData() };
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
					{ label: (data.server && data.server.name) || '—' }
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

				return `<e-server-header :item="server"></e-server-header>`;
			}
		}
	});
});
