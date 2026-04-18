onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'settings-appearance',
		route: '/settings/appearance',
		title: 'Appearance - Settings - OneType Travel',
		grid: {
			template: '"sidebar navbar navbar" "sidebar settings main"',
			columns: '68px 260px 1fr',
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
					{ icon: 'settings', label: 'Settings', href: '/settings' },
					{ label: 'Appearance' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			settings: function()
			{
				return `<e-settings-sidebar></e-settings-sidebar>`;
			},
			main: function()
			{
				return `
					<div class="ot-container-m ot-py-l">
						<e-account-form-appearance></e-account-form-appearance>
					</div>
				`;
			}
		}
	});
});
