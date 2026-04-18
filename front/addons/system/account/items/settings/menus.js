onetype.AddonReady('settings', (settings) =>
{
	settings.Item({
		group: 'Account',
		order: 10,
		items: [
			{ icon: 'person', label: 'Profile', href: '' },
			{ icon: 'lock', label: 'Security', href: '/security' },
			{ icon: 'notifications', label: 'Notifications', href: '/notifications' }
		]
	});

	settings.Item({
		group: 'Preferences',
		order: 30,
		items: [
			{ icon: 'palette', label: 'Appearance', href: '/appearance' }
		]
	});
});
