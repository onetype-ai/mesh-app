onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'not-found',
		route: '/404',
		title: '404 - Mesh',
		404: true,
		grid: {
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		areas: {
			sidebar: function()
			{
				return `<e-dock></e-dock>`;
			},
			navbar: function()
			{
				this.crumbs = [
					{ icon: 'error', label: 'Not found' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function()
			{
				return `
					<div class="ot-flex ot-justify-center ot-items-center" style="min-height: calc(100vh - 64px);">
						<e-status-code></e-status-code>
					</div>
				`;
			}
		}
	});
});
