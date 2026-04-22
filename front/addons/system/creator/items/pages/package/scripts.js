onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'creator-package-scripts',
		route: '/creator/packages/:id/scripts',
		title: 'Package scripts — Creator',
		grid:
		{
			template: '"sidebar navbar navbar" "sidebar main aside"',
			columns: '68px 1fr 340px',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function(parameters)
		{
			const [item, scriptsList] = await Promise.all([
				packages.Find().filter('id', parameters.id).one(),
				scripts.Find().filter('package_id', parameters.id).sort('name', 'asc').limit(1000).many()
			]);

			return {
				package: item ? item.data : null,
				scripts: scriptsList.map((script) => script.data)
			};
		},
		areas:
		{
			sidebar: function()
			{
				return `<e-dock></e-dock>`;
			},
			navbar: function({ data })
			{
				this.crumbs =
				[
					{ icon: 'code', label: 'Creator', href: '/creator/services' },
					{ icon: 'inventory_2', label: 'Packages', href: '/creator/packages' },
					{ label: (data.package && data.package.name) || '—', href: '/creator/packages/' + (data.package && data.package.id) },
					{ label: 'Scripts' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data, parameters })
			{
				this.package = data.package;
				this.items = data.scripts.map((item) =>
				{
					let verification = null;

					if(item.is_marketplace)
					{
						verification = item.is_verified ? 'Verified' : 'Pending';
					}

					return { ...item, verification };
				});

				this.tabs =
				[
					{ id: 'overview', label: 'Overview', icon: 'badge', href: '/creator/packages/' + parameters.id },
					{ id: 'scripts', label: 'Scripts', icon: 'terminal', href: '/creator/packages/' + parameters.id + '/scripts' }
				];

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
						placeholder: 'Install Docker',
						confirm: 'Create'
					});

					if(!name)
					{
						return;
					}

					await $ot.command('scripts:create', {
						data: { name, bash: '#!/bin/bash\n', platforms: ['*'], package_id: parameters.id },
						redirect: 'creator'
					});
				};

				return /* html */ `
					<div class="ot-container-m ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Package scripts"
							description="Scripts that belong to this package — install, uninstall, status and more."
							size="m"
						>
							<e-form-button slot="right" text="Create" color="brand" icon="add" :_click="handleCreate"></e-form-button>
						</e-global-heading>

						<e-navigation-tabs :items="tabs" active="scripts" tone="contained"></e-navigation-tabs>

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
			},
			aside: function({ data })
			{
				this.package = data.package;

				return `<e-creator-info :item="package" type="package"></e-creator-info>`;
			}
		}
	});
});
