onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'creator-service-overview',
		route: '/creator/services/:id',
		title: 'Service — Creator',
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
				scripts.Find().filter('service_id', parameters.id).select(['id', 'name']).sort('name', 'asc').limit(1000).many()
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
					{ label: (data.service && data.service.name) || '—' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data, parameters })
			{
				this.service = data.service;
				this.values = { ...this.service, config: JSON.stringify(this.service.config || {}, null, 2) };
				this.saving = false;

				this.tabs =
				[
					{ id: 'overview', label: 'Overview', icon: 'badge', href: '/creator/services/' + parameters.id },
					{ id: 'scripts', label: 'Scripts', icon: 'terminal', href: '/creator/services/' + parameters.id + '/scripts' }
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
						description: 'How your service appears in the marketplace and inside Mesh. Keep it short and specific.',
						fields:
						[
							{
								key: 'name',
								element: 'form-input',
								label: 'Name',
								description: 'Product-like name — Postgres 16, Llama 3.1 70B, Ollama.',
								required: true,
								properties: { placeholder: 'Postgres 16', background: 'bg-3' }
							},
							{
								key: 'slug',
								element: 'form-input',
								label: 'Slug',
								description: 'Unique identifier used as prefix for emitted metrics. Lowercase, hyphens only.',
								properties: { placeholder: 'postgres-16', background: 'bg-3' }
							},
							{
								key: 'description',
								element: 'form-textarea',
								label: 'Description',
								description: 'What the service does. Ports, volumes, use cases, GPU requirements — anything users need to know.',
								properties: { placeholder: 'PostgreSQL 16 running in Docker with persistent volume.', background: 'bg-3', rows: 3 }
							},
							{
								key: 'version',
								element: 'form-input',
								label: 'Version',
								description: 'Your service version — bumped on breaking changes. Not the underlying app version.',
								properties: { placeholder: '1.0.0', background: 'bg-3' }
							},
							{
								key: 'is_marketplace',
								element: 'form-toggle',
								label: 'Marketplace',
								description: 'Publish this service to the public marketplace once it is approved.',
								properties: { background: 'bg-3' }
							}
						]
					},
					{
						eyebrow: 'Platforms',
						icon: 'lan',
						title: 'Where it runs',
						description: 'Pick every platform this service supports. Mesh hides it on unsupported hosts.',
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
						eyebrow: 'Lifecycle',
						icon: 'terminal',
						title: 'Lifecycle scripts',
						description: 'Scripts that drive requirements, deploy, start, stop, restart, destroy, and status.',
						fields:
						[
							{
								key: 'script_requirements_id',
								element: 'form-select',
								label: 'Requirements script',
								description: 'Preflight check — verifies the host can run this service. Runs before deploy.',
								properties: { options: this.scriptOptions, searchable: true, clearable: true, background: 'bg-3' }
							},
							{
								key: 'script_deploy_id',
								element: 'form-select',
								label: 'Deploy script',
								description: 'First-time setup — pull image, create container, wire volumes. Runs once per deploy.',
								properties: { options: this.scriptOptions, searchable: true, clearable: true, background: 'bg-3' }
							},
							{
								key: 'script_start_id',
								element: 'form-select',
								label: 'Start script',
								description: 'Starts an existing deployment. docker start, systemctl start — fast resume.',
								properties: { options: this.scriptOptions, searchable: true, clearable: true, background: 'bg-3' }
							},
							{
								key: 'script_stop_id',
								element: 'form-select',
								label: 'Stop script',
								description: 'Pauses the service without removing data. docker stop, systemctl stop.',
								properties: { options: this.scriptOptions, searchable: true, clearable: true, background: 'bg-3' }
							},
							{
								key: 'script_restart_id',
								element: 'form-select',
								label: 'Restart script',
								description: 'Cycle the service. Usually stop + start, but can be a single graceful reload.',
								properties: { options: this.scriptOptions, searchable: true, clearable: true, background: 'bg-3' }
							},
							{
								key: 'script_destroy_id',
								element: 'form-select',
								label: 'Destroy script',
								description: 'Full teardown — stop, remove container, delete volumes. Opposite of deploy.',
								properties: { options: this.scriptOptions, searchable: true, clearable: true, background: 'bg-3' }
							},
							{
								key: 'script_status_id',
								element: 'form-select',
								label: 'Status script',
								description: 'Periodic check that writes service.* metrics. Drives dashboards and alerts.',
								properties: { options: this.scriptOptions, searchable: true, clearable: true, background: 'bg-3' }
							}
						]
					},
					{
						eyebrow: 'Indicators',
						icon: 'rule',
						title: 'Deployed and running metrics',
						description: 'Metric keys (emitted by the status script) that indicate if the service is deployed and running. Must be boolean.',
						fields:
						[
							{
								key: 'deployed_metric',
								element: 'form-input',
								label: 'Deployed metric key',
								description: 'Example: service.postgres.installed',
								properties: { placeholder: 'service.postgres.installed', background: 'bg-3' }
							},
							{
								key: 'running_metric',
								element: 'form-input',
								label: 'Running metric key',
								description: 'Example: service.postgres.running. Requires start/stop + status scripts.',
								properties: { placeholder: 'service.postgres.running', background: 'bg-3' }
							}
						]
					},
					{
						eyebrow: 'Config',
						icon: 'tune',
						title: 'User config schema',
						description: 'OneType DataDefine object. Each key becomes a form field when a user deploys this service.',
						fields:
						[
							{
								key: 'config',
								element: 'form-textarea',
								label: 'Config (JSON)',
								description: 'Example: {"port": {"type": "number", "value": 5432}, "password": {"type": "string", "required": true}}. Leave {} if no config.',
								properties: { placeholder: '{}', background: 'bg-3', rows: 12 }
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

					await $ot.command('services:update', {
						id: this.service.id,
						name: value.name,
						slug: value.slug,
						description: value.description,
						version: value.version,
						platforms: value.platforms,
						script_requirements_id: value.script_requirements_id,
						script_deploy_id: value.script_deploy_id,
						script_start_id: value.script_start_id,
						script_stop_id: value.script_stop_id,
						script_restart_id: value.script_restart_id,
						script_destroy_id: value.script_destroy_id,
						script_status_id: value.script_status_id,
						deployed_metric: value.deployed_metric,
						running_metric: value.running_metric,
						is_marketplace: value.is_marketplace,
						config
					});

					this.saving = false;
				};

				return /* html */ `
					<div class="ot-container-m ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Edit service"
							description="Identity, platforms, six lifecycle scripts, condition, and config schema."
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
				this.service = data.service;

				return `<e-creator-info :item="service" type="service"></e-creator-info>`;
			}
		}
	});
});
