onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'marketplace-tabs',
		config:
		{
			active:
			{
				type: 'string',
				value: '',
				description: 'Active tab id.'
			}
		},
		render: function()
		{
			this.tabs =
			[
				{ id: 'services', label: 'Services', icon: 'deployed_code', href: '/marketplace' },
				{ id: 'packages', label: 'Packages', icon: 'inventory_2',   href: '/marketplace/packages' },
				{ id: 'scripts',  label: 'Scripts',  icon: 'terminal',      href: '/marketplace/scripts' }
			];

			return /* html */ `
				<e-navigation-tabs :items="tabs" :active="active" tone="pills" size="m"></e-navigation-tabs>
			`;
		}
	});
});
