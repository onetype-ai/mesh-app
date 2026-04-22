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
	const clamp = (min, max) => (i, fn) => Math.max(min, Math.min(max, fn(i)));

	/* ===== SYSTEM GROUP ===== */

	const systemSchema =
	{
		'system.cpu.usage':
		{
			type: 'percent',
			label: 'CPU usage',
			description: 'Current CPU load across all cores.',
			placement: 'hero',
			icon: 'memory',
			unit: '%',
			thresholds: [
				{ at: 0, color: 'green' },
				{ at: 70, color: 'orange' },
				{ at: 90, color: 'red' }
			]
		},
		'system.ram.usage':
		{
			type: 'percent',
			label: 'RAM usage',
			description: 'Percentage of installed memory used.',
			placement: 'hero',
			icon: 'storage',
			unit: '%',
			thresholds: [
				{ at: 0, color: 'green' },
				{ at: 70, color: 'orange' },
				{ at: 90, color: 'red' }
			]
		},
		'system.uptime':
		{
			type: 'duration',
			label: 'Uptime',
			description: 'Time since last reboot.',
			placement: 'hero',
			icon: 'schedule'
		},
		'system.cpu.load_1':
		{
			type: 'gauge',
			label: 'Load avg (1m)',
			placement: 'hero',
			icon: 'timeline'
		},
		'system.os.name':
		{
			type: 'text',
			label: 'Operating system',
			icon: 'settings'
		},
		'system.os.version':
		{
			type: 'version',
			label: 'OS version',
			icon: 'tag'
		},
		'system.os.kernel':
		{
			type: 'text',
			label: 'Kernel',
			icon: 'terminal'
		},
		'system.arch':
		{
			type: 'text',
			label: 'Architecture',
			icon: 'memory'
		},
		'system.cpu.model':
		{
			type: 'text',
			label: 'CPU',
			icon: 'developer_board'
		},
		'system.cpu.cores':
		{
			type: 'gauge',
			label: 'Cores',
			unit: 'cores',
			icon: 'grid_view'
		},
		'system.ram.total':
		{
			type: 'bytes',
			label: 'RAM total',
			icon: 'storage'
		},
		'system.network.hostname':
		{
			type: 'text',
			label: 'Hostname',
			icon: 'dns'
		},
		'system.network.mac':
		{
			type: 'identifier',
			label: 'MAC address',
			icon: 'lan'
		},
		'system.cpu.series':
		{
			type: 'series',
			label: 'CPU usage',
			description: 'Last 30 minutes of CPU load.',
			unit: '%'
		},
		'system.ram.series':
		{
			type: 'series',
			label: 'RAM usage',
			unit: '%'
		},
		'system.disk':
		{
			type: 'list',
			label: 'Disks',
			description: 'Mounted block devices.',
			icon: 'storage',
			each:
			{
				device: { type: 'text', label: 'Device' },
				total: { type: 'bytes', label: 'Total', align: 'right' },
				used: { type: 'bytes', label: 'Used', align: 'right' },
				free: { type: 'bytes', label: 'Free', align: 'right' }
			}
		},
		'system.network.interfaces':
		{
			type: 'list',
			label: 'Network interfaces',
			icon: 'lan',
			each:
			{
				interface: { type: 'text', label: 'Interface' },
				rx_bytes: { type: 'bytes', label: 'Received' },
				tx_bytes: { type: 'bytes', label: 'Transmitted' }
			}
		}
	};

	const systemSnapshots = makeSnapshots(60, {
		'system.cpu.usage': drift(34, 22),
		'system.ram.usage': drift(62, 12),
		'system.uptime': (i) => 3_289_000 + i * 30,
		'system.cpu.load_1': drift(1.8, 0.6),
		'system.os.name': () => 'macOS',
		'system.os.version': () => '15.6.1',
		'system.os.kernel': () => '24.6.0',
		'system.arch': () => 'arm64',
		'system.cpu.model': () => 'Apple M4',
		'system.cpu.cores': () => 10,
		'system.ram.total': () => 17_179_869_184,
		'system.network.hostname': () => 'mac-local.fleet.mesh',
		'system.network.mac': () => 'd0:11:e5:70:82:a7',
		'system.cpu.series': drift(34, 22),
		'system.ram.series': drift(62, 12),
		'system.disk': () =>
		[
			{ device: '/dev/disk1', total: 524_288_000, used: 626_688, free: 506_273_792 },
			{ device: '/dev/disk2', total: 5_368_664_064, used: 2_063_589_376, free: 3_283_443_712 },
			{ device: '/dev/disk3', total: 245_107_195_904, used: 17_954_992_128, free: 16_099_885_056 }
		],
		'system.network.interfaces': () =>
		[
			{ interface: 'en0', rx_bytes: 42_111_990, tx_bytes: 18_221_882 },
			{ interface: 'en1', rx_bytes: 537_494_413_591, tx_bytes: 194_268_019_569 }
		]
	});

	/* ===== PACKAGE: DOCKER ===== */

	const dockerSchema =
	{
		'package.docker.installed':
		{
			type: 'boolean',
			label: 'Installed',
			description: 'Whether the Docker engine is present on the host.',
			placement: 'hero',
			icon: 'check_circle'
		},
		'package.docker.running':
		{
			type: 'boolean',
			label: 'Daemon running',
			placement: 'hero',
			icon: 'play_circle'
		},
		'package.docker.version':
		{
			type: 'version',
			label: 'Version',
			placement: 'hero',
			icon: 'tag'
		},
		'package.docker.containers':
		{
			type: 'gauge',
			label: 'Containers',
			description: 'Currently running containers.',
			placement: 'hero',
			icon: 'inventory_2',
			unit: 'running'
		},
		'package.docker.images':
		{
			type: 'gauge',
			label: 'Images',
			icon: 'image'
		},
		'package.docker.disk_usage':
		{
			type: 'bytes',
			label: 'Disk usage',
			icon: 'storage'
		},
		'package.docker.cpu':
		{
			type: 'percent',
			label: 'Docker CPU',
			unit: '%'
		},
		'package.docker.series':
		{
			type: 'series',
			label: 'Containers over time',
			unit: 'running'
		},
		'package.docker.list':
		{
			type: 'list',
			label: 'Running containers',
			icon: 'view_module',
			each:
			{
				name: { type: 'text', label: 'Name' },
				image: { type: 'text', label: 'Image' },
				cpu: { type: 'percent', label: 'CPU', align: 'right' },
				memory: { type: 'bytes', label: 'Memory', align: 'right' },
				uptime: { type: 'duration', label: 'Uptime', align: 'right' }
			}
		}
	};

	const dockerSnapshots = makeSnapshots(60, {
		'package.docker.installed': () => true,
		'package.docker.running': () => true,
		'package.docker.version': () => '24.0.7',
		'package.docker.containers': (i) => 4 + (i % 3),
		'package.docker.images': () => 12,
		'package.docker.disk_usage': () => 12_884_901_888,
		'package.docker.cpu': drift(18, 10),
		'package.docker.series': (i) => 4 + (i % 3),
		'package.docker.list': () =>
		[
			{ name: 'postgres', image: 'postgres:16', cpu: 3.4, memory: 512_000_000, uptime: 86400 },
			{ name: 'redis', image: 'redis:7-alpine', cpu: 1.1, memory: 128_000_000, uptime: 129600 },
			{ name: 'nginx', image: 'nginx:latest', cpu: 0.8, memory: 64_000_000, uptime: 172800 },
			{ name: 'traefik', image: 'traefik:3.0', cpu: 2.2, memory: 96_000_000, uptime: 259200 }
		]
	});

	/* ===== SERVICE: VLLM ===== */

	const vllmSchema =
	{
		'service.vllm.deployed':
		{
			type: 'boolean',
			label: 'Deployed',
			placement: 'hero',
			icon: 'check_circle'
		},
		'service.vllm.running':
		{
			type: 'boolean',
			label: 'Running',
			placement: 'hero',
			icon: 'play_circle'
		},
		'service.vllm.gpu_usage':
		{
			type: 'percent',
			label: 'GPU usage',
			placement: 'hero',
			icon: 'developer_board',
			unit: '%',
			thresholds: [
				{ at: 0, color: 'green' },
				{ at: 75, color: 'orange' },
				{ at: 92, color: 'red' }
			]
		},
		'service.vllm.rps':
		{
			type: 'rate',
			label: 'Requests / s',
			placement: 'hero',
			icon: 'speed',
			unit: 'req/s'
		},
		'service.vllm.queue':
		{
			type: 'gauge',
			label: 'Queue depth',
			icon: 'pending',
			unit: 'pending'
		},
		'service.vllm.active_requests':
		{
			type: 'gauge',
			label: 'Active requests',
			icon: 'bolt'
		},
		'service.vllm.model':
		{
			type: 'text',
			label: 'Model',
			icon: 'smart_toy'
		},
		'service.vllm.vram_used':
		{
			type: 'bytes',
			label: 'VRAM used',
			icon: 'memory'
		},
		'service.vllm.tokens_per_second':
		{
			type: 'rate',
			label: 'Tokens / s',
			icon: 'format_list_numbered',
			unit: 'tok/s'
		},
		'service.vllm.public_url':
		{
			type: 'link',
			label: 'Public URL',
			icon: 'link'
		},
		'service.vllm.last_restart':
		{
			type: 'timestamp',
			label: 'Last restart',
			icon: 'restart_alt'
		},
		'service.vllm.build_hash':
		{
			type: 'identifier',
			label: 'Build hash',
			icon: 'fingerprint'
		},
		'service.vllm.rps_series':
		{
			type: 'series',
			label: 'Requests per second',
			unit: 'req/s'
		},
		'service.vllm.gpu_series':
		{
			type: 'series',
			label: 'GPU usage',
			unit: '%'
		},
		'service.vllm.latency':
		{
			type: 'histogram',
			label: 'Response latency',
			description: 'p50/p95/p99 distribution of request latency.',
			icon: 'bar_chart',
			unit: 'ms'
		}
	};

	const vllmSnapshots = makeSnapshots(60, {
		'service.vllm.deployed': () => true,
		'service.vllm.running': (i) => i > 5,
		'service.vllm.gpu_usage': drift(78, 10),
		'service.vllm.rps': drift(12.4, 6),
		'service.vllm.queue': (i) => Math.max(0, Math.floor((Math.random() - 0.4) * 6)),
		'service.vllm.active_requests': drift(14, 8),
		'service.vllm.model': () => 'meta-llama/Llama-3.1-70B-Instruct',
		'service.vllm.vram_used': () => 63_278_123_520,
		'service.vllm.tokens_per_second': drift(1840, 320),
		'service.vllm.public_url': () => 'https://vllm-abc123.mesh.onetype.ai',
		'service.vllm.last_restart': () => new Date(now - 5 * 3600 * 1000).toISOString(),
		'service.vllm.build_hash': () => 'a1b2c3d4e5f6789012345678abcdef1234567890',
		'service.vllm.rps_series': drift(12.4, 6),
		'service.vllm.gpu_series': drift(78, 10),
		'service.vllm.latency': (i) => (
		{
			sum: 82_400 + i * 100,
			count: 3_400 + i * 5,
			buckets:
			[
				{ le: 50, count: 1_800 + i * 2 },
				{ le: 100, count: 2_600 + i * 3 },
				{ le: 200, count: 3_100 + i * 4 },
				{ le: 400, count: 3_280 + i * 4 },
				{ le: 800, count: 3_360 + i * 5 },
				{ le: 1600, count: 3_400 + i * 5 }
			]
		})
	});

	pages.Item({
		id: 'dashboard-test2',
		route: '/test2',
		title: 'Dashboard test — single server',
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
					{ label: 'Single server test' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function()
			{
				this.server = { id: '1', name: 'Mac Local', status: 'Active', ip: '192.168.1.4', platform: 'Darwin' };

				this.groups =
				[
					{
						id: 'system',
						name: 'System',
						description: 'Host-level metrics from globally-attached scripts.',
						icon: 'dns',
						color: 'brand',
						source: 'global',
						status: 'Running',
						statusColor: 'green',
						schema: systemSchema,
						snapshots: systemSnapshots
					},
					{
						id: 'docker',
						name: 'Docker',
						description: 'Container runtime package — install, status, containers, images.',
						icon: 'inventory_2',
						color: 'blue',
						source: 'package',
						status: 'Running',
						statusColor: 'green',
						schema: dockerSchema,
						snapshots: dockerSnapshots
					},
					{
						id: 'vllm',
						name: 'vLLM Llama 70B',
						description: 'High-throughput LLM inference service.',
						icon: 'smart_toy',
						color: 'red',
						source: 'service',
						status: 'Running',
						statusColor: 'green',
						schema: vllmSchema,
						snapshots: vllmSnapshots
					}
				];

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Server dashboard"
							description="Metric schemas from system scripts, package Docker and service vLLM — composed into one live view."
							size="m"
						></e-global-heading>

						<e-dashboard-grid :server="server" :groups="groups"></e-dashboard-grid>
					</div>
				`;
			}
		}
	});
});
