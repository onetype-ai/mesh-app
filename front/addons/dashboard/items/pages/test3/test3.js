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

	/* ===== FORUM SERVICE ===== */

	const forumSchema =
	{
		'service.discourse.deployed':
		{
			type: 'boolean',
			label: 'Deployed',
			placement: 'hero',
			icon: 'check_circle'
		},
		'service.discourse.running':
		{
			type: 'boolean',
			label: 'Running',
			placement: 'hero',
			icon: 'play_circle'
		},
		'service.discourse.online_users':
		{
			type: 'gauge',
			label: 'Online users',
			description: 'Users with active session in the last 5 minutes.',
			placement: 'hero',
			icon: 'group',
			unit: 'users'
		},
		'service.discourse.uptime':
		{
			type: 'duration',
			label: 'Process uptime',
			placement: 'hero',
			icon: 'schedule'
		},
		'service.discourse.requests_per_second':
		{
			type: 'rate',
			label: 'Request rate',
			icon: 'speed',
			unit: 'req/s'
		},
		'service.discourse.posts_per_minute':
		{
			type: 'rate',
			label: 'Posts / min',
			icon: 'forum',
			unit: 'posts/min'
		},
		'service.discourse.new_signups_today':
		{
			type: 'counter',
			label: 'New signups today',
			icon: 'person_add'
		},
		'service.discourse.topics_total':
		{
			type: 'counter',
			label: 'Total topics',
			icon: 'topic'
		},
		'service.discourse.posts_total':
		{
			type: 'counter',
			label: 'Total posts',
			icon: 'chat'
		},
		'service.discourse.flagged_posts':
		{
			type: 'gauge',
			label: 'Flagged (unresolved)',
			icon: 'flag',
			unit: 'posts',
			thresholds: [
				{ at: 0, color: 'green' },
				{ at: 5, color: 'orange' },
				{ at: 20, color: 'red' }
			]
		},
		'service.discourse.cache_hit_rate':
		{
			type: 'percent',
			label: 'Cache hit rate',
			icon: 'bolt',
			unit: '%',
			thresholds: [
				{ at: 0, color: 'red' },
				{ at: 70, color: 'orange' },
				{ at: 90, color: 'green' }
			]
		},
		'service.discourse.db_connections':
		{
			type: 'gauge',
			label: 'DB connections',
			icon: 'database'
		},
		'service.discourse.queue_depth':
		{
			type: 'gauge',
			label: 'Sidekiq queue',
			description: 'Background jobs waiting to run.',
			icon: 'pending_actions',
			unit: 'jobs'
		},
		'service.discourse.email_bounce_rate':
		{
			type: 'percent',
			label: 'Email bounce rate',
			icon: 'mail',
			unit: '%',
			thresholds: [
				{ at: 0, color: 'green' },
				{ at: 2, color: 'orange' },
				{ at: 5, color: 'red' }
			]
		},
		'service.discourse.version':
		{
			type: 'version',
			label: 'Discourse version',
			icon: 'tag'
		},
		'service.discourse.git_commit':
		{
			type: 'identifier',
			label: 'Git commit',
			icon: 'commit'
		},
		'service.discourse.public_url':
		{
			type: 'link',
			label: 'Forum URL',
			icon: 'public'
		},
		'service.discourse.last_backup':
		{
			type: 'timestamp',
			label: 'Last backup',
			icon: 'backup'
		},
		'service.discourse.media_storage':
		{
			type: 'bytes',
			label: 'Media storage',
			icon: 'image'
		},
		'service.discourse.users_series':
		{
			type: 'series',
			label: 'Online users',
			description: 'Concurrent users over the last 30 minutes.',
			unit: 'users'
		},
		'service.discourse.rps_series':
		{
			type: 'series',
			label: 'Requests per second',
			unit: 'req/s'
		},
		'service.discourse.response_time':
		{
			type: 'histogram',
			label: 'Response time',
			description: 'p50/p95/p99 for all rendered pages.',
			icon: 'timer',
			unit: 'ms'
		},
		'service.discourse.top_categories':
		{
			type: 'list',
			label: 'Top categories (24h)',
			icon: 'label',
			each:
			{
				name: { type: 'text', label: 'Category' },
				posts: { type: 'counter', label: 'Posts', align: 'right' },
				views: { type: 'counter', label: 'Views', align: 'right' },
				new_topics: { type: 'counter', label: 'New topics', align: 'right' }
			}
		},
		'service.discourse.active_plugins':
		{
			type: 'list',
			label: 'Active plugins',
			icon: 'extension',
			each:
			{
				name: { type: 'text', label: 'Plugin' },
				version: { type: 'version', label: 'Version' },
				enabled: { type: 'boolean', label: 'Enabled', align: 'center' }
			}
		}
	};

	const forumSnapshots = makeSnapshots(60, {
		'service.discourse.deployed': () => true,
		'service.discourse.running': () => true,
		'service.discourse.online_users': drift(340, 80),
		'service.discourse.uptime': (i) => 1_123_400 + i * 30,
		'service.discourse.requests_per_second': drift(62, 18),
		'service.discourse.posts_per_minute': drift(14, 8),
		'service.discourse.new_signups_today': (i) => 124 + Math.floor(i / 8),
		'service.discourse.topics_total': (i) => 48_230 + Math.floor(i / 20),
		'service.discourse.posts_total': (i) => 812_440 + i,
		'service.discourse.flagged_posts': (i) => Math.max(0, Math.floor(3 + Math.sin(i / 10) * 3)),
		'service.discourse.cache_hit_rate': drift(92.5, 4),
		'service.discourse.db_connections': drift(28, 6),
		'service.discourse.queue_depth': drift(12, 18),
		'service.discourse.email_bounce_rate': drift(1.2, 0.6),
		'service.discourse.version': () => '3.2.1',
		'service.discourse.git_commit': () => '7f3a9b2c8e4d6f1a9b2c8e4d6f1a9b2c8e4d6f1a',
		'service.discourse.public_url': () => 'https://forum.example.com',
		'service.discourse.last_backup': () => new Date(now - 8 * 3600 * 1000).toISOString(),
		'service.discourse.media_storage': () => 42_139_467_776,
		'service.discourse.users_series': drift(340, 80),
		'service.discourse.rps_series': drift(62, 18),
		'service.discourse.response_time': (i) => (
		{
			sum: 194_800 + i * 240,
			count: 4_200 + i * 8,
			buckets:
			[
				{ le: 50, count: 1_100 + i * 2 },
				{ le: 100, count: 2_300 + i * 4 },
				{ le: 200, count: 3_400 + i * 5 },
				{ le: 400, count: 3_900 + i * 6 },
				{ le: 800, count: 4_120 + i * 7 },
				{ le: 1600, count: 4_200 + i * 8 }
			]
		}),
		'service.discourse.top_categories': () =>
		[
			{ name: 'General', posts: 842, views: 28_410, new_topics: 31 },
			{ name: 'Help & Support', posts: 612, views: 19_200, new_topics: 88 },
			{ name: 'Showcase', posts: 421, views: 15_800, new_topics: 24 },
			{ name: 'Meta', posts: 202, views: 6_400, new_topics: 9 },
			{ name: 'Off-topic', posts: 1_210, views: 42_100, new_topics: 12 }
		],
		'service.discourse.active_plugins': () =>
		[
			{ name: 'discourse-solved', version: '1.4.0', enabled: true },
			{ name: 'discourse-calendar', version: '0.4', enabled: true },
			{ name: 'discourse-voting', version: '1.2.1', enabled: true },
			{ name: 'discourse-chat', version: '0.7', enabled: false },
			{ name: 'discourse-ai', version: '0.3', enabled: true }
		]
	});

	/* ===== POSTGRES (shared with forum) ===== */

	const postgresSchema =
	{
		'service.postgres.running':
		{
			type: 'boolean',
			label: 'Running',
			placement: 'hero',
			icon: 'play_circle'
		},
		'service.postgres.connections':
		{
			type: 'gauge',
			label: 'Connections',
			placement: 'hero',
			icon: 'cable'
		},
		'service.postgres.cache_hit_rate':
		{
			type: 'percent',
			label: 'Cache hit rate',
			placement: 'hero',
			icon: 'bolt',
			unit: '%',
			thresholds: [
				{ at: 0, color: 'red' },
				{ at: 90, color: 'orange' },
				{ at: 98, color: 'green' }
			]
		},
		'service.postgres.db_size':
		{
			type: 'bytes',
			label: 'Database size',
			icon: 'database'
		},
		'service.postgres.slow_queries':
		{
			type: 'counter',
			label: 'Slow queries (1h)',
			icon: 'warning'
		},
		'service.postgres.version':
		{
			type: 'version',
			label: 'Version',
			icon: 'tag'
		}
	};

	const postgresSnapshots = makeSnapshots(60, {
		'service.postgres.running': () => true,
		'service.postgres.connections': drift(32, 8),
		'service.postgres.cache_hit_rate': drift(98.6, 0.8),
		'service.postgres.db_size': (i) => 3_120_000_000 + i * 200_000,
		'service.postgres.slow_queries': (i) => 2 + Math.floor(i / 20),
		'service.postgres.version': () => '16.2'
	});

	/* ===== REDIS (shared with forum) ===== */

	const redisSchema =
	{
		'service.redis.running':
		{
			type: 'boolean',
			label: 'Running',
			placement: 'hero',
			icon: 'play_circle'
		},
		'service.redis.clients':
		{
			type: 'gauge',
			label: 'Clients',
			placement: 'hero',
			icon: 'cable'
		},
		'service.redis.ops_per_sec':
		{
			type: 'rate',
			label: 'Ops / sec',
			placement: 'hero',
			icon: 'speed',
			unit: 'ops/s'
		},
		'service.redis.memory_used':
		{
			type: 'bytes',
			label: 'Memory used',
			icon: 'memory'
		},
		'service.redis.evicted_keys':
		{
			type: 'counter',
			label: 'Evicted keys (1h)',
			icon: 'delete_sweep'
		},
		'service.redis.version':
		{
			type: 'version',
			label: 'Version',
			icon: 'tag'
		}
	};

	const redisSnapshots = makeSnapshots(60, {
		'service.redis.running': () => true,
		'service.redis.clients': drift(18, 6),
		'service.redis.ops_per_sec': drift(2200, 400),
		'service.redis.memory_used': () => 184_432_640,
		'service.redis.evicted_keys': (i) => i % 5 === 0 ? 1 : 0,
		'service.redis.version': () => '7.2.4'
	});

	pages.Item({
		id: 'dashboard-test3',
		route: '/test3',
		title: 'Dashboard test — forum',
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
					{ label: 'Forum service' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function()
			{
				this.server = { id: '1', name: 'community-eu-01', status: 'Active', ip: '10.0.1.24', platform: 'Linux' };

				this.groups =
				[
					{
						id: 'discourse',
						name: 'Discourse forum',
						description: 'Rails forum service with background workers, cache, and uploads.',
						icon: 'forum',
						color: 'brand',
						source: 'service',
						status: 'Running',
						statusColor: 'green',
						schema: forumSchema,
						snapshots: forumSnapshots
					},
					{
						id: 'postgres',
						name: 'Postgres 16',
						description: 'Primary datastore for the forum.',
						icon: 'database',
						color: 'blue',
						source: 'service',
						status: 'Running',
						statusColor: 'green',
						schema: postgresSchema,
						snapshots: postgresSnapshots
					},
					{
						id: 'redis',
						name: 'Redis 7',
						description: 'Cache, session store, and Sidekiq queue backend.',
						icon: 'memory',
						color: 'red',
						source: 'service',
						status: 'Running',
						statusColor: 'green',
						schema: redisSchema,
						snapshots: redisSnapshots
					}
				];

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Community forum server"
							description="Same schema-first dashboard — this time a Discourse deployment with Postgres and Redis sidecars."
							size="m"
						></e-global-heading>

						<e-dashboard-grid :server="server" :groups="groups"></e-dashboard-grid>
					</div>
				`;
			}
		}
	});
});
