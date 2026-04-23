onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'server-sidebar',
		config:
		{
			item:
			{
				type: 'object',
				value: null,
				description: 'Server row from servers addon.'
			}
		},
		render: function()
		{
			this.Compute(() =>
			{
				const id = this.item ? this.item.id : '';
				const base = '/servers/' + id;
				const name = this.item ? this.item.name : '—';
				const hostname = this.item && this.item.metrics ? this.item.metrics['system.network.hostname'] : '';

				this.title = name;
				this.subtitle = hostname;

				this.groups =
				[
					{
						placement: 'top',
						items:
						[
							{ icon: 'dashboard', label: 'Dashboard', href: base, match: base },
							{ icon: 'rocket_launch', label: 'Setup', href: base + '/setup' }
						]
					},
					{
						title: 'Automation',
						placement: 'top',
						items:
						[
							{ icon: 'deployed_code', label: 'Services', href: base + '/services' },
							{ icon: 'inventory_2', label: 'Packages', href: base + '/packages' },
							{ icon: 'terminal', label: 'Scripts', href: base + '/scripts' }
						]
					},
					{
						title: 'Monitoring',
						placement: 'top',
						items:
						[
							{ icon: 'analytics', label: 'Metrics', href: base + '/metrics' }
						]
					},
					{
						placement: 'bottom',
						items:
						[
							{ icon: 'terminal', label: 'Terminal', href: base + '/terminal' },
							{ icon: 'description', label: 'Logs', href: base + '/logs' },
							{ icon: 'settings', label: 'Settings', href: base + '/settings' }
						]
					}
				];
			});

			return /* html */ `
				<e-navigation-sidebar
					:title="title"
					:subtitle="subtitle"
					:groups="groups"
					background="bg-2"
				></e-navigation-sidebar>
			`;
		}
	});
});
