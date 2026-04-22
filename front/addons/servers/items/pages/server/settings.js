onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'server-settings',
		route: '/servers/:id/settings',
		title: 'Settings',
		grid:
		{
			template: '"sidebar navbar navbar" "sidebar server main"',
			columns: '68px 260px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function(parameters)
		{
			const item = await servers.Find().filter('id', parameters.id).one();

			if(!item)
			{
				return $ot.page('/404');
			}

			return { server: item.GetData() };
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
					{ icon: 'dns', label: 'Servers', href: '/servers' },
					{ label: data.server.name, href: '/servers/' + data.server.id },
					{ label: 'Settings' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			server: function({ data })
			{
				this.server = data.server;

				return `<e-server-sidebar :item="server"></e-server-sidebar>`;
			},
			main: function({ data })
			{
				/* ===== STATE ===== */

				this.values = { name: data.server.name, system_refresh: data.server.system_refresh };
				this.deleting = false;

				this.refreshOptions =
				[
					{ label: '5 seconds', value: 5 },
					{ label: '10 seconds', value: 10 },
					{ label: '30 seconds', value: 30 },
					{ label: '1 minute', value: 60 },
					{ label: '5 minutes', value: 300 },
					{ label: '10 minutes', value: 600 },
					{ label: '30 minutes', value: 1800 }
				];

				this.sections =
				[
					{
						eyebrow: 'Identity',
						icon: 'dns',
						title: 'Server name',
						description: 'A friendly name so you can tell it apart from the rest of the fleet.',
						fields:
						[
							{
								key: 'name',
								element: 'form-input',
								label: 'Name',
								required: true,
								properties: { placeholder: 'Production GPU Box', background: 'bg-3' }
							}
						]
					},
					{
						eyebrow: 'Polling',
						icon: 'autorenew',
						title: 'System metrics refresh',
						description: 'How often the agent should report CPU, RAM, disk and network usage. Shorter intervals mean more accurate graphs but more network traffic.',
						fields:
						[
							{
								key: 'system_refresh',
								element: 'form-select',
								label: 'Refresh interval',
								required: true,
								properties: { options: this.refreshOptions, background: 'bg-3' }
							}
						]
					}
				];

				/* ===== HANDLERS ===== */

				this.change = async ({ key, value }) =>
				{
					await $ot.command('servers:update', {
						id: data.server.id,
						[key]: value
					});
				};

				this.remove = async () =>
				{
					const confirmed = await $ot.confirm(
						'Delete server',
						'This will permanently remove ' + data.server.name + ' from your fleet. This cannot be undone.',
						{ confirm: 'Delete server', cancel: 'Cancel', color: 'red' }
					);

					if(!confirmed)
					{
						return;
					}

					this.deleting = true;

					await $ot.command('servers:delete', { id: data.server.id });

					this.deleting = false;
				};

				/* ===== RENDER ===== */

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical ot-gap-l">
						<e-global-heading
							title="Settings"
							description="Rename the server or remove it from your fleet."
							size="m"
						></e-global-heading>

						<e-core-builder
							:values="values"
							:sections="sections"
							:section="{ background: 'bg-2', variant: ['border'] }"
							:_change="change"
							save=""
							size="m"
						></e-core-builder>

						<e-form-section
							eyebrow="Danger zone"
							icon="warning"
							title="Delete this server"
							description="Permanently remove this server from your fleet. The agent will be disconnected and all associated scripts, packages and services will be marked as deleted. This cannot be undone."
							color="red"
							background="bg-2"
							:variant="['border']"
						>
							<div slot="content" class="ot-p-l">
								<e-form-button
									text="Delete server"
									icon="delete"
									color="red"
									:loading="deleting"
									:_click="remove"
								></e-form-button>
							</div>
						</e-form-section>
					</div>
				`;
			}
		}
	});
});
