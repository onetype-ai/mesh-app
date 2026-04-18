onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'notifications',
		route: ['/notifications', '/notifications/:tab'],
		title: 'Notifications - OneType Travel',
		grid:
		{
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		areas:
		{
			sidebar: function()
			{
				return `<e-dock></e-dock>`;
			},
			navbar: function()
			{
				this.crumbs = [{ icon: 'notifications', label: 'Notifications', href: '/notifications' }];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function()
			{
				this.tab = this.parameters.tab || 'all';

				this.tabs =
				[
					{ id: 'all', label: 'All', icon: 'notifications', count: 28, href: '/notifications' },
					{ id: 'bookings', label: 'Bookings', icon: 'event_available', count: 4, href: '/notifications/bookings' },
					{ id: 'listings', label: 'Listings', icon: 'apartment', count: 6, href: '/notifications/listings' }
				];

				this.items =
				[
					{ type: 'booking', icon: 'event_available', title: 'New booking request — Villa Lipova', description: 'Ana Marković wants to book June 12–16 for 2 guests.', time: '2 minutes ago', unread: true, action: 'View', href: '/manage/stays' },
					{ type: 'approval', icon: 'check_circle', title: 'Your listing was approved', description: 'Stari Grad Apartments is now live and visible to all travellers.', time: '1 hour ago', unread: true }
				];

				return /* html */ `
					<div class="ot-container-m ot-py-l ot-flex ot-flex-col ot-gap-l">
						<div class="ot-flex ot-items-center ot-justify-between">
							<e-global-heading
								title="<em>Notifications</em>"
								description="4 unread · 28 total this week"
								size="m"
							></e-global-heading>
							<e-form-button
								text="Mark all read"
								icon="done_all"
								tone="ghost"
								size="m"
							></e-form-button>
						</div>

						<e-navigation-tabs :items="tabs" :active="tab"></e-navigation-tabs>

						<div class="ot-flex ot-flex-col ot-gap-s">
							<div ot-for="item in items">
								<e-notification-card :item="item"></e-notification-card>
							</div>
						</div>
					</div>
				`;
			}
		}
	});
});
