onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'creator-service-scripts',
		route: '/creator/services/:id/scripts',
		title: 'Service scripts — Creator',
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
				services.Find().filter('id', parameters.id).one(),
				scripts.Find().filter('service_id', parameters.id).sort('name', 'asc').limit(1000).many()
			]);

			return {
				service: item ? item.data : null,
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
					{ icon: 'deployed_code', label: 'Services', href: '/creator/services' },
					{ label: (data.service && data.service.name) || '—', href: '/creator/services/' + (data.service && data.service.id) },
					{ label: 'Scripts' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data, parameters })
			{
				this.service = data.service;
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
					{ id: 'overview', label: 'Overview', icon: 'badge', href: '/creator/services/' + parameters.id },
					{ id: 'scripts', label: 'Scripts', icon: 'terminal', href: '/creator/services/' + parameters.id + '/scripts' }
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
						placeholder: 'Deploy',
						confirm: 'Create'
					});

					if(!name)
					{
						return;
					}

					await $ot.command('scripts:create', {
						data: { name, bash: '#!/bin/bash\n', platforms: ['*'], service_id: parameters.id },
						redirect: 'creator'
					});
				};

				return /* html */ `
					<div class="ot-container-m ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Service scripts"
							description="Scripts that belong to this service — deploy, start, stop, restart, destroy, status."
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
				this.service = data.service;

				return `<e-creator-info :item="service" type="service"></e-creator-info>`;
			}
		}
	});
});
