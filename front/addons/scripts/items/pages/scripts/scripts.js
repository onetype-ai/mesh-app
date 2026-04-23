onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'scripts',
		route: '/scripts',
		title: 'Scripts',
		grid:
		{
			template: '"sidebar navbar" "sidebar main" "sidebar terminal"',
			columns: '68px 1fr',
			rows: 'auto 1fr 300px',
			gap: '0'
		},
		data: async function()
		{
			const [list, usage, fleet] = await Promise.all([
				scripts.Find().filter('package_id', null, 'NULL').sort('created_at', 'desc').limit(1000).many(),
				servers.scripts.Find().limit(5000).many(),
				servers.Find().sort('name', 'asc').limit(1000).many()
			]);

			return {
				items: list.map((item) => item.GetData()),
				usage: usage.map((row) => row.GetData()),
				fleet: fleet.map((server) => server.GetData())
			};
		},
		areas:
		{
			sidebar: function()
			{
				return `<e-dock></e-dock>`;
			},
			navbar: function()
			{
				this.crumbs = [{ icon: 'terminal', label: 'Scripts' }];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data })
			{
				this.items    = data.items;
				this.attaching = false;

				this.servers = (script) =>
				{
					return data.usage
						.filter((entry) => entry.script_id === script.id)
						.map((entry) => data.fleet.find((server) => server.id === entry.server_id))
						.filter(Boolean);
				};

				this.tags = (script) =>
				{
					return this.servers(script).map((server) => ({
						id:    server.id,
						label: server.name,
						icon:  'dns',
						color: server.is_connected ? 'green' : null
					}));
				};

				this.attach = async (script) =>
				{
					if(this.attaching)
					{
						return;
					}

					const answer = await $ot.confirm('Attach ' + script.name, 'Enter the server ID to attach this script to.', {
						icon:        'dns',
						input:       true,
						placeholder: 'Server ID…',
						confirm:     'Attach',
						cancel:      'Cancel'
					});

					if(!answer)
					{
						return;
					}

					const server = String(answer).trim();

					this.attaching = true;
					this.Emit('scripts.terminal.open', { server });

					try
					{
						const { code, message } = await $ot.command('servers:scripts:attach', {
							server_id: server,
							script_id: script.id
						}, true);

						if(code !== 200)
						{
							$ot.toast({ message, type: 'error' });
							return;
						}

						$ot.toast({ message: script.name + ' attached.', type: 'success' });
					}
					finally
					{
						this.attaching = false;
						setTimeout(() => this.Emit('scripts.terminal.close'), 10000);
					}
				};

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Scripts"
							description="Bash recipes that run on your servers — collect metrics, deploy services, react to events."
							size="m"
						></e-global-heading>

						<e-status-empty
							ot-if="items.length === 0"
							icon="terminal"
							title="No scripts yet"
							description="Create your first script or install one from the marketplace."
						></e-status-empty>

						<div ot-if="items.length > 0" class="ot-grid-auto-l">
							<e-script-card ot-for="item in items" :item="item">
								<div ot-if="tags(item).length" slot="tags">
									<e-global-tags :items="tags(item)" tone="pills" size="s"></e-global-tags>
								</div>

								<div slot="actions">
									<e-form-button
										text="Edit"
										icon="edit"
										tone="ghost"
										size="s"
										:href="'/creator/scripts/' + item.id"
									></e-form-button>
									<e-form-button
										text="Attach"
										icon="link"
										color="brand"
										tone="soft"
										size="s"
										:loading="attaching"
										:_click="() => attach(item)"
									></e-form-button>
								</div>
							</e-script-card>
						</div>
					</div>
				`;
			},
			terminal: function()
			{
				this.server = '';

				this.On('scripts.terminal.open', ({ server }) =>
				{
					this.server = server;
				});

				this.On('scripts.terminal.close', () =>
				{
					this.server = '';
				});

				return /* html */ `
					<e-terminal :server="server" :readonly="true" :empty="true" background="bg-2" :variant="['border-top']"></e-terminal>
				`;
			}
		}
	});
});
