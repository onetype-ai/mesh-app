onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'creator-scripts',
		route: '/creator/scripts',
		title: 'Scripts — Creator',
		grid:
		{
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function()
		{
			const list = await scripts.Find()
				.filter('package_id', null, 'NULL')
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
					{ label: 'Scripts' }
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
					{ id: 'output', label: 'Output', type: 'chip', width: '100px' },
					{ id: 'platforms', label: 'Platforms', type: 'tags', width: '160px' },
					{ id: 'verification', label: 'Verification', type: 'status', width: '140px' },
					{ id: 'status', label: 'Status', type: 'status', width: '120px' },
					{ id: 'updated_at', label: 'Updated', type: 'timeago', width: '140px', align: 'right' }
				];

				this.handleClick = ({ value }) =>
				{
					$ot.page('/creator/scripts/' + value.id);
				};

				this.handleCreate = async () =>
				{
					const name = await $ot.confirm('Create script', 'Enter script name.', {
						input: true,
						placeholder: 'Collect system info',
						confirm: 'Create'
					});

					if(!name)
					{
						return;
					}

					await $ot.command('scripts:create', {
						data: { name, bash: '#!/bin/bash\n', platforms: ['*'] },
						redirect: 'creator'
					});
				};

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Scripts"
							description="Bash recipes you author — metrics, actions, building blocks for packages and services."
							size="m"
						>
							<e-form-button slot="right" text="Create" color="brand" icon="add" :_click="handleCreate"></e-form-button>
						</e-global-heading>

						<e-creator-tabs active="scripts"></e-creator-tabs>

						<e-data-table
							background="bg-2"
							:variant="['border']"
							:columns="columns"
							:items="items"
							:_click="handleClick"
							search="Search scripts…"
						></e-data-table>
					</div>
				`;
			}
		}
	});
});
