onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'creator-script',
		route: '/creator/scripts/:id',
		title: 'Script — Creator',
		grid:
		{
			template: '"sidebar navbar navbar" "sidebar main aside"',
			columns: '68px 1fr 340px',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function(parameters)
		{
			const item = await scripts.Find()
				.filter('id', parameters.id)
				.join('packages', 'package_id', 'package', (j) =>
				{
					j.select(['id', 'name']);
				})
				.join('services', 'service_id', 'service', (j) =>
				{
					j.select(['id', 'name']);
				})
				.one();

			return { script: item ? item.data : null };
		},
		areas:
		{
			sidebar: function()
			{
				return `<e-dock></e-dock>`;
			},
			navbar: function({ data })
			{
				const script = data.script || {};
				const pkg = script.package;
				const svc = script.service;

				this.crumbs = [{ icon: 'code', label: 'Creator', href: '/creator/services' }];

				if(pkg && pkg.id)
				{
					this.crumbs.push({ icon: 'inventory_2', label: 'Packages', href: '/creator/packages' });
					this.crumbs.push({ label: pkg.name || '—', href: '/creator/packages/' + pkg.id });
					this.crumbs.push({ icon: 'terminal', label: 'Scripts', href: '/creator/packages/' + pkg.id + '/scripts' });
				}
				else if(svc && svc.id)
				{
					this.crumbs.push({ icon: 'deployed_code', label: 'Services', href: '/creator/services' });
					this.crumbs.push({ label: svc.name || '—', href: '/creator/services/' + svc.id });
					this.crumbs.push({ icon: 'terminal', label: 'Scripts', href: '/creator/services/' + svc.id + '/scripts' });
				}
				else
				{
					this.crumbs.push({ icon: 'terminal', label: 'Scripts', href: '/creator/scripts' });
				}

				this.crumbs.push({ label: script.name || '—' });

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data })
			{
				this.script = data.script;
				this.values =
				{
					...this.script,
					config: JSON.stringify(this.script.config || {}, null, 2),
					metrics: JSON.stringify(this.script.metrics || [], null, 2)
				};
				this.saving = false;

				this.sections =
				[
					{
						eyebrow: 'Identity',
						icon: 'badge',
						title: 'Name and description',
						description: 'How your script appears in the marketplace and inside Mesh. Keep it short and specific.',
						fields:
						[
							{
								key: 'name',
								element: 'form-input',
								label: 'Name',
								description: 'A short, action-based name. What this script does, in 2-4 words.',
								required: true,
								properties: { placeholder: 'Collect system usage', background: 'bg-3' }
							},
							{
								key: 'slug',
								element: 'form-input',
								label: 'Slug',
								description: 'Unique identifier used as prefix for emitted metrics. Lowercase, hyphens only.',
								properties: { placeholder: 'collect-system-usage', background: 'bg-3' }
							},
							{
								key: 'description',
								element: 'form-textarea',
								label: 'Description',
								description: 'One or two sentences. What data it collects, what action it takes, which platforms it targets.',
								properties: { placeholder: 'Short summary of what this script does.', background: 'bg-3', rows: 3 }
							},
							{
								key: 'is_marketplace',
								element: 'form-toggle',
								label: 'Marketplace',
								description: 'Publish this script to the public marketplace once it is approved.',
								properties: { background: 'bg-3' }
							}
						]
					},
					{
						eyebrow: 'Platforms',
						icon: 'lan',
						title: 'Where it runs',
						description: 'Select every platform this script supports. Mesh skips the script on unsupported hosts.',
						fields:
						[
							{
								key: 'platforms',
								element: 'form-tags',
								label: 'Platforms',
								description: 'Pick * for cross-platform, or choose specific OS families. At least one is required.',
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
						eyebrow: 'Output',
						icon: 'data_object',
						title: 'How output is parsed',
						description: 'Raw captures stdout as text. JSON parses it into structured data so widgets can render metrics.',
						fields:
						[
							{
								key: 'output',
								element: 'form-select',
								label: 'Output mode',
								description: 'Use JSON when the script prints a {"key": value} object. Use Raw for install/uninstall or one-shot actions.',
								properties:
								{
									options:
									[
										{ label: 'Raw',  value: 'Raw' },
										{ label: 'JSON', value: 'JSON' }
									],
									background: 'bg-3'
								}
							},
							{
								key: 'autorun',
								element: 'form-toggle',
								label: 'Autorun on connect',
								description: 'Run once automatically as soon as a server comes online. Useful for collecting baseline metrics.'
							},
							{
								key: 'loop',
								element: 'form-input',
								label: 'Loop interval (ms)',
								description: 'Repeat on a fixed interval while the server is connected. Leave empty for one-shot. Minimum recommended 5000ms.',
								properties: { type: 'number', placeholder: '10000', background: 'bg-3' }
							}
						]
					},
					{
						eyebrow: 'Source',
						icon: 'terminal',
						title: 'Bash script',
						description: 'The script body. Runs as root on the target machine through the Mesh agent. Keep it idempotent and exit with a non-zero code on failure.',
						fields:
						[
							{
								key: 'bash',
								element: 'form-textarea',
								label: 'Bash',
								description: 'Always start with set -e. Print a JSON object to stdout if Output mode is JSON. Use stderr for warnings, exit code for status.',
								required: true,
								properties: { placeholder: '#!/usr/bin/env bash\nset -e\n...', background: 'bg-3', rows: 16 }
							}
						]
					},
					{
						eyebrow: 'Config',
						icon: 'tune',
						title: 'User config schema',
						description: 'OneType DataDefine object. Each key becomes a form field when a user runs this script with parameters.',
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
					},
					{
						eyebrow: 'Metrics',
						icon: 'analytics',
						title: 'Metric widgets schema',
						description: 'Array of widget definitions. Each entry describes how a key from JSON output renders on the dashboard.',
						fields:
						[
							{
								key: 'metrics',
								element: 'form-textarea',
								label: 'Metrics (JSON)',
								description: 'Example: [{"id": "cpu", "key": "system.cpu.usage", "label": "CPU Usage", "widget": "progress", "unit": "%"}]. Leave [] if no metrics.',
								properties: { placeholder: '[]', background: 'bg-3', rows: 12 }
							}
						]
					}
				];

				this.save = async ({ value }) =>
				{
					this.saving = true;

					let config = {};
					let metrics = {};

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

					try
					{
						metrics = JSON.parse(value.metrics || '{}');
					}
					catch(error)
					{
						$ot.toast({ type: 'error', message: 'Invalid JSON in Metrics: ' + error.message });
						this.saving = false;
						return;
					}

					try
					{
						for(const entry of Object.values(config))
						{
							onetype.DataDefine({ ...entry }, 'config', true);
						}
					}
					catch(error)
					{
						$ot.toast({ type: 'error', message: 'Invalid config entry: ' + error.message });
						this.saving = false;
						return;
					}

					try
					{
						for(const entry of Object.values(metrics))
						{
							onetype.DataDefine({ ...entry }, 'metric', true);
						}
					}
					catch(error)
					{
						$ot.toast({ type: 'error', message: 'Invalid metric entry: ' + error.message });
						this.saving = false;
						return;
					}

					await $ot.command('scripts:update', {
						id: this.script.id,
						name: value.name,
						slug: value.slug,
						description: value.description,
						bash: value.bash,
						platforms: value.platforms,
						autorun: value.autorun,
						loop: value.loop,
						output: value.output,
						is_marketplace: value.is_marketplace,
						package_id: value.package_id,
						server_id: value.server_id,
						service_id: value.service_id,
						config,
						metrics
					});

					this.saving = false;
				};

				return /* html */ `
					<div class="ot-container-m ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Edit script"
							description="Fine-tune your script — identity, platforms, output, and the bash body."
							size="m"
						></e-global-heading>

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
				this.script = data.script;

				return `<e-creator-info :item="script" type="script"></e-creator-info>`;
			}
		}
	});
});
