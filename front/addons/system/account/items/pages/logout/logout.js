onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'auth-logout',
		route: '/auth/logout',
		title: 'Sign out - OneType Travel',
		grid: {
			template: '"content"',
			columns: '1fr',
			rows: '1fr',
			gap: '0'
		},
		areas: {
			content: function()
			{
				return /* html */ `
					<e-account-logout></e-account-logout>
				`;
			}
		}
	});
});
