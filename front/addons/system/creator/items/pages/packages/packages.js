onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'creator-packages',
		route: '/creator/packages',
		title: 'Packages — Creator',
		grid:
		{
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function()
		{
			const list = await packages.Find()
				.sort('created_at', 'desc')
				.limit(1000)
				.many();

			return { items: list.map((item) => item.data) };
		},
		areas:
		{
			sidebar: function()
			{
				return `<e-dock></e-dock>`;
			},
			navbar: function()
			{
				this.crumbs =
				[
					{ icon: 'code', label: 'Creator', href: '/creator/services' },
					{ label: 'Packages' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data })
			{
				this.items = data.items.map((item) =>
				{
					let verification = null;

					if(item.is_marketplace)
					{
						verification = item.is_verified ? 'Verified' : 'Pending';
					}

					return { ...item, verification };
				});

				this.columns =
				[
					{ id: 'name', label: 'Name', type: 'text', width: '1.5fr' },
					{ id: 'version', label: 'Version', type: 'chip', width: '120px' },
					{ id: 'verification', label: 'Verification', type: 'status', width: '140px' },
					{ id: 'status', label: 'Status', type: 'status', width: '120px' },
					{ id: 'updated_at', label: 'Updated', type: 'timeago', width: '140px', align: 'right' }
				];

				this.handleClick = ({ value }) =>
				{
					$ot.page('/creator/packages/' + value.id);
				};

				this.handleCreate = async () =>
				{
					const name = await $ot.confirm('Create package', 'Enter package name.', {
						input: true,
						placeholder: 'docker',
						confirm: 'Create'
					});

					if(!name)
					{
						return;
					}

					await $ot.command('packages:create', {
						data: { name },
						redirect: 'creator'
					});
				};

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Packages"
							description="System-level tools you author — install and status scripts, reusable across servers."
							size="m"
						>
							<e-form-button slot="right" text="Create" color="brand" icon="add" :_click="handleCreate"></e-form-button>
						</e-global-heading>

						<e-creator-tabs active="packages"></e-creator-tabs>

						<e-data-table
							background="bg-2"
							:variant="['border']"
							:columns="columns"
							:items="items"
							:_click="handleClick"
							search="Search packages…"
						></e-data-table>
					</div>
				`;
			}
		}
	});
});
