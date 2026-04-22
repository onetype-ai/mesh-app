onetype.AddonReady('pages', (pages) =>
{
	const now = Date.now();

	const makeSnapshots = (length, template) =>
	{
		const out = [];
		for(let i = 0; i < length; i++)
		{
			const date = new Date(now - (length - 1 - i) * 30_000).toISOString();
			const values = {};
			for(const [key, fn] of Object.entries(template))
			{
				const value = fn(i, length);
				if(value !== undefined)
				{
					values[key] = value;
				}
			}
			out.push({ date, values });
		}
		return out;
	};

	const drift = (base, amp) => (i) => Math.max(0, base + (Math.sin(i / 6) * amp * 0.4) + (Math.random() - 0.5) * amp);

	const systemSchema =
	{
		'system.cpu.usage':
		{
			type: 'percent',
			label: 'CPU usage',
			description: 'Current fleet-average CPU load.',
			placement: 'hero',
			unit: '%',
			thresholds: [
				{ at: 0, color: 'green' },
				{ at: 60, color: 'orange' },
				{ at: 85, color: 'red' }
			]
		},
		'system.ram.usage':
		{
			type: 'percent',
			label: 'RAM usage',
			description: 'Fleet-average RAM used.',
			placement: 'hero',
			unit: '%',
			thresholds: [
				{ at: 0, color: 'green' },
				{ at: 70, color: 'orange' },
				{ at: 90, color: 'red' }
			]
		},
		'system.servers.active':
		{
			type: 'gauge',
			label: 'Active servers',
			description: 'Servers currently reachable.',
			icon: 'dns',
			placement: 'hero'
		},
		'system.servers.total':
		{
			type: 'gauge',
			label: 'Total servers',
			icon: 'hub',
			placement: 'hero'
		},
		'system.cpu.cores':
		{
			type: 'gauge',
			label: 'CPU cores',
			description: 'Total CPU cores across the fleet.',
			icon: 'memory',
			unit: 'cores'
		},
		'system.ram.total':
		{
			type: 'bytes',
			label: 'RAM total',
			icon: 'storage'
		},
		'system.gpu.total':
		{
			type: 'gauge',
			label: 'GPUs',
			icon: 'developer_board',
			unit: 'units'
		},
		'system.network.rx_rate':
		{
			type: 'rate',
			label: 'Network in',
			icon: 'arrow_downward',
			unit: 'MB/s'
		},
		'system.network.tx_rate':
		{
			type: 'rate',
			label: 'Network out',
			icon: 'arrow_upward',
			unit: 'MB/s'
		},
		'system.cpu.series':
		{
			type: 'series',
			label: 'CPU average',
			description: 'Fleet-wide average CPU over the last 30 minutes.',
			icon: 'show_chart',
			unit: '%'
		},
		'system.ram.series':
		{
			type: 'series',
			label: 'RAM average',
			icon: 'show_chart',
			unit: '%'
		}
	};

	const fleetSnapshots = makeSnapshots(60, {
		'system.cpu.usage': drift(42, 22),
		'system.ram.usage': drift(61, 14),
		'system.servers.active': () => 9,
		'system.servers.total': () => 12,
		'system.cpu.cores': () => 206,
		'system.ram.total': () => 824_633_720_832,
		'system.gpu.total': () => 8,
		'system.network.rx_rate': drift(120, 60),
		'system.network.tx_rate': drift(85, 40),
		'system.cpu.series': drift(42, 22),
		'system.ram.series': drift(61, 14)
	});

	pages.Item({
		id: 'dashboard-test',
		route: '/test',
		title: 'Dashboard test — fleet',
		grid:
		{
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
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
					{ icon: 'dashboard', label: 'Dashboards' },
					{ label: 'Fleet test' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function()
			{
				this.fleet =
				{
					name: 'Fleet overview',
					description: 'Aggregated metrics from every active server.',
					icon: 'hub',
					schema: systemSchema,
					snapshots: fleetSnapshots
				};

				this.servers =
				[
					{ id: '1', name: 'Mac Local', status: 'Active' },
					{ id: '2', name: 'GPU Beast 01', status: 'Active' },
					{ id: '3', name: 'Edge Node EU', status: 'Active' },
					{ id: '4', name: 'GPU Beast 02', status: 'Inactive' },
					{ id: '5', name: 'Dev Workstation', status: 'Active' }
				];

				this.packages =
				{
					items:
					[
						{ id: 'docker', name: 'Docker', slug: 'docker', icon: 'inventory_2', color: 'blue' },
						{ id: 'git', name: 'Git', slug: 'git', icon: 'commit', color: 'orange' },
						{ id: 'nvidia', name: 'NVIDIA Driver', slug: 'nvidia', icon: 'memory', color: 'green' },
						{ id: 'tailscale', name: 'Tailscale', slug: 'tailscale', icon: 'vpn_lock', color: 'brand' }
					],
					cells:
					[
						{ item_id: 'docker', server_id: '1', state: 'missing', stats: [] },
						{ item_id: 'docker', server_id: '2', state: 'running', stats: [{ label: 'Version', value: '24.0.7' }, { label: 'Containers', value: '12' }] },
						{ item_id: 'docker', server_id: '3', state: 'running', stats: [{ label: 'Version', value: '24.0.7' }, { label: 'Containers', value: '4' }] },
						{ item_id: 'docker', server_id: '4', state: 'unavailable', stats: [] },
						{ item_id: 'docker', server_id: '5', state: 'stopped', stats: [{ label: 'Version', value: '23.0.1' }] },

						{ item_id: 'git', server_id: '1', state: 'running', stats: [{ label: 'Version', value: '2.39.5' }] },
						{ item_id: 'git', server_id: '2', state: 'running', stats: [{ label: 'Version', value: '2.43.0' }] },
						{ item_id: 'git', server_id: '3', state: 'running', stats: [{ label: 'Version', value: '2.43.0' }] },
						{ item_id: 'git', server_id: '4', state: 'unavailable', stats: [] },
						{ item_id: 'git', server_id: '5', state: 'running', stats: [{ label: 'Version', value: '2.42.0' }] },

						{ item_id: 'nvidia', server_id: '1', state: 'missing', stats: [] },
						{ item_id: 'nvidia', server_id: '2', state: 'running', stats: [{ label: 'Driver', value: '550.54' }, { label: 'GPUs', value: '4' }] },
						{ item_id: 'nvidia', server_id: '3', state: 'missing', stats: [] },
						{ item_id: 'nvidia', server_id: '4', state: 'unavailable', stats: [] },
						{ item_id: 'nvidia', server_id: '5', state: 'missing', stats: [] },

						{ item_id: 'tailscale', server_id: '1', state: 'running', stats: [{ label: 'Peers', value: '8' }] },
						{ item_id: 'tailscale', server_id: '2', state: 'running', stats: [{ label: 'Peers', value: '8' }] },
						{ item_id: 'tailscale', server_id: '3', state: 'running', stats: [{ label: 'Peers', value: '8' }] },
						{ item_id: 'tailscale', server_id: '4', state: 'unavailable', stats: [] },
						{ item_id: 'tailscale', server_id: '5', state: 'stopped', stats: [] }
					]
				};

				this.services =
				{
					items:
					[
						{ id: 'postgres', name: 'Postgres 16', slug: 'postgres-16', icon: 'database', color: 'blue' },
						{ id: 'redis', name: 'Redis 7', slug: 'redis-7', icon: 'memory', color: 'red' },
						{ id: 'vllm', name: 'vLLM Llama 70B', slug: 'vllm-llama-70b', icon: 'smart_toy', color: 'brand' },
						{ id: 'ollama', name: 'Ollama', slug: 'ollama', icon: 'psychology', color: 'green' },
						{ id: 'nginx', name: 'Nginx', slug: 'nginx', icon: 'dns', color: 'orange' }
					],
					cells:
					[
						{ item_id: 'postgres', server_id: '1', state: 'running', stats: [{ label: 'Connections', value: '18' }] },
						{ item_id: 'postgres', server_id: '2', state: 'missing', stats: [] },
						{ item_id: 'postgres', server_id: '3', state: 'running', stats: [{ label: 'Connections', value: '42' }] },
						{ item_id: 'postgres', server_id: '4', state: 'unavailable', stats: [] },
						{ item_id: 'postgres', server_id: '5', state: 'deployed', stats: [{ label: 'Version', value: '16.2' }] },

						{ item_id: 'redis', server_id: '1', state: 'missing', stats: [] },
						{ item_id: 'redis', server_id: '2', state: 'missing', stats: [] },
						{ item_id: 'redis', server_id: '3', state: 'running', stats: [{ label: 'Memory', value: '512 MB' }] },
						{ item_id: 'redis', server_id: '4', state: 'unavailable', stats: [] },
						{ item_id: 'redis', server_id: '5', state: 'stopped', stats: [] },

						{ item_id: 'vllm', server_id: '1', state: 'missing', stats: [] },
						{ item_id: 'vllm', server_id: '2', state: 'running', stats: [{ label: 'req/s', value: '12.4' }, { label: 'GPU', value: '78%' }] },
						{ item_id: 'vllm', server_id: '3', state: 'missing', stats: [] },
						{ item_id: 'vllm', server_id: '4', state: 'unavailable', stats: [] },
						{ item_id: 'vllm', server_id: '5', state: 'missing', stats: [] },

						{ item_id: 'ollama', server_id: '1', state: 'running', stats: [{ label: 'Models', value: '3' }] },
						{ item_id: 'ollama', server_id: '2', state: 'missing', stats: [] },
						{ item_id: 'ollama', server_id: '3', state: 'missing', stats: [] },
						{ item_id: 'ollama', server_id: '4', state: 'unavailable', stats: [] },
						{ item_id: 'ollama', server_id: '5', state: 'running', stats: [{ label: 'Models', value: '5' }] },

						{ item_id: 'nginx', server_id: '1', state: 'missing', stats: [] },
						{ item_id: 'nginx', server_id: '2', state: 'running', stats: [{ label: 'req/s', value: '240' }] },
						{ item_id: 'nginx', server_id: '3', state: 'running', stats: [{ label: 'req/s', value: '1.2k' }] },
						{ item_id: 'nginx', server_id: '4', state: 'unavailable', stats: [] },
						{ item_id: 'nginx', server_id: '5', state: 'failing', stats: [{ label: 'Error', value: 'port 80' }] }
					]
				};

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Fleet dashboard"
							description="Fleet-level metrics plus which packages and services run on which servers — one unified view."
							size="m"
						></e-global-heading>

						<e-dashboard-servers
							:fleet="fleet"
							:servers="servers"
							:packages="packages"
							:services="services"
						></e-dashboard-servers>
					</div>
				`;
			}
		}
	});
});
