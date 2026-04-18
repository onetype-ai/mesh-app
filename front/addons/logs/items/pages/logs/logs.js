onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'logs',
		route: '/logs',
		title: 'Logs',
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
					{ icon: 'description', label: 'Logs' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function()
			{
				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Logs"
							description="Every script run, every agent event, every system change — in one feed."
							size="m"
						></e-global-heading>

						<e-logs></e-logs>
					</div>
				`;
			}
		}
	});
});
