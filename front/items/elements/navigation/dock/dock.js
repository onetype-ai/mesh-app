elements.ItemAdd({
	id: 'dock',
	render: function()
	{
		this.logo = 'https://images.onetype.ai/96752e47-1bea-4313-025c-5b76dc174200/public';

		this.groups = [
			{
				placement: 'top',
				items: [
					{ icon: 'grid_view', label: 'Dashboard', href: '/', match: '/' },
					{ icon: 'dns', label: 'Servers', href: '/servers' },
					{ icon: 'deployed_code', label: 'Services', href: '/services' },
					{ icon: 'inventory_2', label: 'Packages', href: '/packages' },
					{ icon: 'terminal', label: 'Scripts', href: '/scripts' }
				]
			}
		];

		const bottom = [
			{ icon: 'description', label: 'Logs', href: '/logs' }
		];

		if(this.state.user)
		{
			bottom.push({ icon: 'settings', label: 'Settings', href: '/settings' });
		}

		this.groups.push({ placement: 'bottom', items: bottom });

		return /* html */ `
			<e-navigation-dock :logo="logo" background="bg-2" :groups="groups"></e-navigation-dock>
		`;
	}
});
