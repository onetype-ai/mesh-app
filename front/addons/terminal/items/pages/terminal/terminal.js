onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'terminal',
		route: '/terminal',
		title: 'Terminal',
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
					{ icon: 'terminal', label: 'Terminal' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function()
			{
				return `<e-terminal></e-terminal>`;
			}
		}
	});
});
