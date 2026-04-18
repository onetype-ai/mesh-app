onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'navbar',
		config:
		{
			crumbs:
			{
				type: 'array',
				value: [],
				each:
				{
					type: 'object',
					config:
					{
						label: { type: 'string', value: '' },
						href: { type: 'string', value: '' },
						icon: { type: 'string', value: '' }
					}
				}
			}
		},
		render: function()
		{
			/* ===== STATE ===== */
			this.search = '';

			const path = onetype.RouteCurrent();

			if (path.startsWith('/marketplace'))
			{
				this.mode = 'marketplace';
			}
			else
			{
				this.mode = 'manage';
			}

			this.tabs =
			[
				{ id: 'manage', label: 'Manage', icon: 'grid_view', href: '/' },
				{ id: 'marketplace', label: 'Marketplace', icon: 'storefront', href: '/marketplace' }
			];

			/* ===== HANDLERS ===== */
			this.changeSearch = ({ value }) =>
			{
				this.search = value;
			};

			/* ===== RENDER ===== */
			return /* html */ `
				<header class="holder">
					<nav class="crumbs">
						<a ot-for="crumb, i in crumbs" class="crumb" :href="crumb.href || 'javascript:void(0)'">
							<i ot-if="crumb.icon">{{ crumb.icon }}</i>
							<span>{{ crumb.label }}</span>
						</a>
					</nav>

					<div class="search">
						<e-form-input
							icon="search"
							placeholder="Search..."
							:value="search"
							:_input="changeSearch"
							background="bg-3"
							size="m"
						></e-form-input>
						<span class="kbd">⌘K</span>
					</div>

					<div class="right">
						<e-navigation-tabs
							:items="tabs"
							:active="mode"
							background="bg-2"
							size="m"
							tone="contained"
						></e-navigation-tabs>

						<e-form-button
							icon="notifications"
							href="/notifications"
							tone="ghost"
							size="m"
							tooltip="Notifications"
							:variant="['icon-only']"
						></e-form-button>

						<e-form-button
							ot-if="state.user"
							text="Add a server"
							icon="add"
							color="dark"
							tone="solid"
							size="m"
						></e-form-button>

						<e-form-button
							ot-if="state.user"
							icon="logout"
							href="/auth/logout"
							tone="ghost"
							size="m"
							tooltip="Logout"
							:variant="['icon-only']"
						></e-form-button>

						<e-form-button
							ot-if="!state.user"
							text="Sign in"
							icon="login"
							href="/auth/login"
							color="dark"
							tone="solid"
							size="m"
						></e-form-button>
					</div>
				</header>
			`;
		}
	});
});
