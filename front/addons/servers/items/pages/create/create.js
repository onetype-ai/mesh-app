onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'servers-create',
		route: '/servers/create',
		title: 'Add a server',
		grid:
		{
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function()
		{
			const [scriptsList, packagesList] = await Promise.all([
				scripts.Find()
					.select(['id', 'name', 'description'])
					.filter('status', 'Published')
					.filter('package_id', null)
					.filter('service_id', null)
					.sort('name', 'asc')
					.limit(1000)
					.many(),
				packages.Find()
					.select(['id', 'name', 'description'])
					.filter('status', 'Published')
					.sort('name', 'asc')
					.limit(1000)
					.many()
			]);

			return {
				scripts: scriptsList.map((item) => item.data),
				packages: packagesList.map((item) => item.data),
				services: []
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
				this.crumbs =
				[
					{ icon: 'dns', label: 'Servers', href: '/servers' },
					{ label: 'Add a server' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data })
			{
				/* ===== STATE ===== */

				this.values = { name: '', scripts: [], packages: [], services: [] };
				this.saving = false;

				this.scriptOptions = data.scripts.map((script) =>
				{
					return {
						label: script.name,
						value: String(script.id),
						description: script.description
					};
				});

				this.packageOptions = data.packages.map((pkg) =>
				{
					return {
						label: pkg.name,
						value: String(pkg.id),
						description: pkg.description
					};
				});

				this.serviceOptions = data.services.map((service) =>
				{
					return {
						label: service.name,
						value: String(service.id),
						description: service.description
					};
				});

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
						eyebrow: 'Automation',
						icon: 'terminal',
						title: 'Scripts',
						description: 'Scripts this server will run on every connect and on their loop intervals. We recommend always keeping Collect system information and Collect system usage on — they power the metrics dashboard.',
						fields:
						[
							{
								key: 'scripts',
								element: 'form-tags',
								label: 'Scripts',
								properties:
								{
									mode: 'input',
									options: this.scriptOptions,
									placeholder: 'Type to search scripts…',
									searchable: true,
									restrict: true,
									background: 'bg-3'
								}
							}
						]
					},
					{
						eyebrow: 'System',
						icon: 'inventory_2',
						title: 'Packages',
						description: 'System-level tools like Git, Docker or NVIDIA drivers. Install scripts will run on first connect.',
						fields:
						[
							{
								key: 'packages',
								element: 'form-tags',
								label: 'Packages',
								properties:
								{
									mode: 'input',
									options: this.packageOptions,
									placeholder: 'Type to search packages…',
									searchable: true,
									restrict: true,
									background: 'bg-3'
								}
							}
						]
					},
					{
						eyebrow: 'Workloads',
						icon: 'deployed_code',
						title: 'Services',
						description: 'Long-running services that this server will host — databases, AI runtimes, web apps.',
						fields:
						[
							{
								key: 'services',
								element: 'form-tags',
								label: 'Services',
								properties:
								{
									mode: 'input',
									options: this.serviceOptions,
									placeholder: 'Type to search services…',
									searchable: true,
									restrict: true,
									background: 'bg-3'
								}
							}
						]
					}
				];

				/* ===== HANDLERS ===== */

				this.save = async ({ value }) =>
				{
					this.saving = true;

					await $ot.command('servers:create', {
						name: value.name,
						scripts: value.scripts,
						packages: value.packages,
						services: value.services
					});

					this.saving = false;
				};

				/* ===== RENDER ===== */

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Add a server"
							description="Give it a name, pick the scripts you want running, and connect an agent."
							size="m"
						></e-global-heading>

						<e-core-builder
							:values="values"
							:sections="sections"
							:section="{ background: 'bg-2', variant: ['border'] }"
							:_save="save"
							:disabled="saving"
							save="Create server"
							size="m"
						></e-core-builder>
					</div>
				`;
			}
		}
	});
});
