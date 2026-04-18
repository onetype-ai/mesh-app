onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'auth-login',
		route: '/auth/login',
		title: 'Sign in - OneType Travel',
		grid: {
			template: '"content"',
			columns: '1fr',
			rows: '1fr',
			gap: '0'
		},
		areas: {
			content: function()
			{
				return `<e-account-login></e-account-login>`;
			}
		}
	});
});
