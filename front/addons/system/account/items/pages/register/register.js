onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'auth-register',
		route: '/auth/register',
		title: 'Create account - OneType Travel',
		grid: {
			template: '"content"',
			columns: '1fr',
			rows: '1fr',
			gap: '0'
		},
		areas: {
			content: function()
			{
				return `<e-account-register></e-account-register>`;
			}
		}
	});
});
