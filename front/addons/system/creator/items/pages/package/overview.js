onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'creator-package-overview',
		route: '/creator/packages/:id',
		title: 'Package — Creator',
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
				scripts.Find().filter('package_id', parameters.id).select(['id', 'name']).sort('name', 'asc').limit(1000).many()
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
					{ label: (data.package && data.package.name) || '—' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data, parameters })
			{
				this.package = data.package;
				this.values = { ...this.package, config: JSON.stringify(this.package.config || {}, null, 2) };
				this.saving = false;

				this.tabs =
				[
					{ id: 'overview', label: 'Overview', icon: 'badge', href: '/creator/packages/' + parameters.id },
					{ id: 'scripts', label: 'Scripts', icon: 'terminal', href: '/creator/packages/' + parameters.id + '/scripts' }
				];

				this.scriptOptions = data.scripts.map((script) =>
				{
					return { label: script.name, value: String(script.id) };
				});

				this.sections =
				[
					{
						eyebrow: 'Identity',
						icon: 'badge',
						title: 'Name, description, version',
						description: 'How your package appears in the marketplace and inside Mesh. Keep it short and specific.',
						fields:
						[
							{
								key: 'name',
								element: 'form-input',
								label: 'Name',
								description: 'Product-like name — Docker, NVIDIA Driver, Tailscale.',
								required: true,
								properties: { placeholder: 'Docker', background: 'bg-3' }
							},
							{
								key: 'slug',
								element: 'form-input',
								label: 'Slug',
								description: 'Unique identifier used as prefix for emitted metrics. Lowercase, hyphens only.',
								properties: { placeholder: 'docker', background: 'bg-3' }
							},
							{
								key: 'description',
								element: 'form-textarea',
								label: 'Description',
								description: 'One or two sentences. What the package installs, which workflows it enables.',
								properties: { placeholder: 'Container runtime with Compose plugin.', background: 'bg-3', rows: 3 }
							},
							{
								key: 'version',
								element: 'form-input',
								label: 'Version',
								description: 'Your package version — bumped on breaking changes. Not the underlying tool version.',
								properties: { placeholder: '1.0.0', background: 'bg-3' }
							},
							{
								key: 'is_marketplace',
								element: 'form-toggle',
								label: 'Marketplace',
								description: 'Publish this package to the public marketplace once it is approved.',
								properties: { background: 'bg-3' }
							}
						]
					},
					{
						eyebrow: 'Platforms',
						icon: 'lan',
						title: 'Where it installs',
						description: 'Pick every platform this package supports. Mesh hides it on unsupported hosts.',
						fields:
						[
							{
								key: 'platforms',
								element: 'form-tags',
								label: 'Platforms',
								description: 'Pick * for cross-platform, or choose specific OS families.',
								properties:
								{
									mode: 'select',
									options:
									[
										{ label: 'All',    value: '*' },
										{ label: 'Linux',  value: 'Linux' },
										{ label: 'macOS',  value: 'Darwin' }
									],
									restrict: true,
									background: 'bg-3'
								}
							}
						]
					},
					{
						eyebrow: 'Scripts',
						icon: 'terminal',
						title: 'Lifecycle scripts',
						description: 'Select the scripts that drive requirements, install, uninstall and status. Status emits metrics used by the installed_metric.',
						fields:
						[
							{
								key: 'script_requirements_id',
								element: 'form-select',
								label: 'Requirements script',
								description: 'Preflight check — verifies the host can install this package. Runs before install.',
								properties: { options: this.scriptOptions, searchable: true, clearable: true, background: 'bg-3' }
							},
							{
								key: 'script_install_id',
								element: 'form-select',
								label: 'Install script',
								description: 'Runs once when the package is installed on a server.',
								properties: { options: this.scriptOptions, searchable: true, clearable: true, background: 'bg-3' }
							},
							{
								key: 'script_uninstall_id',
								element: 'form-select',
								label: 'Uninstall script',
								description: 'Runs when the package is removed. Must leave the host clean.',
								properties: { options: this.scriptOptions, searchable: true, clearable: true, background: 'bg-3' }
							},
							{
								key: 'script_status_id',
								element: 'form-select',
								label: 'Status script',
								description: 'Periodic check that writes package.* metrics. Used to detect drift and verify install.',
								properties: { options: this.scriptOptions, searchable: true, clearable: true, background: 'bg-3' }
							}
						]
					},
					{
						eyebrow: 'Indicator',
						icon: 'rule',
						title: 'Installed metric',
						description: 'The metric key (emitted by the status script) that indicates if the package is installed. Must be boolean.',
						fields:
						[
							{
								key: 'installed_metric',
								element: 'form-input',
								label: 'Installed metric key',
								description: 'Example: package.docker.installed',
								properties: { placeholder: 'package.docker.installed', background: 'bg-3' }
							}
						]
					},
					{
						eyebrow: 'Config',
						icon: 'tune',
						title: 'User config schema',
						description: 'OneType DataDefine object. Each key becomes a form field when a user installs this package.',
						fields:
						[
							{
								key: 'config',
								element: 'form-textarea',
								label: 'Config (JSON)',
								description: 'Example: {"version": {"type": "string", "value": "latest"}, "port": {"type": "number", "value": 8000}}. Leave {} if no config.',
								properties: { placeholder: '{}', background: 'bg-3', rows: 10 }
							}
						]
					}
				];

				this.save = async ({ value }) =>
				{
					this.saving = true;

					let config = {};

					try
					{
						config = JSON.parse(value.config || '{}');
					}
					catch(error)
					{
						$ot.toast({ type: 'error', message: 'Invalid JSON in Config: ' + error.message });
						this.saving = false;
						return;
					}

					await $ot.command('packages:update', {
						id: this.package.id,
						name: value.name,
						slug: value.slug,
						description: value.description,
						version: value.version,
						platforms: value.platforms,
						script_requirements_id: value.script_requirements_id,
						script_install_id: value.script_install_id,
						script_uninstall_id: value.script_uninstall_id,
						script_status_id: value.script_status_id,
						installed_metric: value.installed_metric,
						is_marketplace: value.is_marketplace,
						config
					});

					this.saving = false;
				};

				return /* html */ `
					<div class="ot-container-m ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Edit package"
							description="Identity, platforms, lifecycle scripts, condition, and config schema."
							size="m"
						></e-global-heading>

						<e-navigation-tabs :items="tabs" active="overview" tone="contained"></e-navigation-tabs>

						<e-core-builder
							:values="values"
							:sections="sections"
							:section="{ background: 'bg-2', variant: ['border'] }"
							:_save="save"
							:disabled="saving"
							save="Save changes"
							size="m"
						></e-core-builder>
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
