elements.ItemAdd({
	id: 'settings-sidebar',
	icon: 'side_navigation',
	name: 'Settings Sidebar',
	description: 'Dynamically built sidebar from settings addon items.',
	category: 'Settings',
	author: 'OneType',
	render: function()
	{
		const sorted = Object.values(settings.Items()).filter(item => item.Get('group')).sort((a, b) => a.Get('order') - b.Get('order'));

		this.groups = [];

		sorted.forEach(item =>
		{
			this.groups.push({
				title: item.Get('group'),
				items: item.Get('items').map(entry => ({
					icon: entry.icon,
					label: entry.label,
					href: '/settings' + entry.href,
					match: '/settings' + entry.href
				}))
			});
		});

		return /* html */ `
			<e-sidebar title="Settings" subtitle="Your preferences" :groups="groups"></e-sidebar>
		`;
	}
});