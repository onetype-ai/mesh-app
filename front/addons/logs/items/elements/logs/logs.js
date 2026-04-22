onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'logs',
		icon: 'description',
		name: 'Logs',
		description: 'Live feed of audit events with filters, correlation grouping and target/reference enrichment.',
		category: 'Logs',
		config:
		{
			target_type:
			{
				type: 'string',
				value: '',
				options: ['', 'Server', 'Script', 'Package', 'Service'],
				description: 'Optional scope by target type.'
			},
			target_id:
			{
				type: 'string',
				value: '',
				description: 'Optional scope by target id.'
			},
			correlation_id:
			{
				type: 'string',
				value: '',
				description: 'Optional scope by correlation id — shows one flow only.'
			}
		},
		render: function()
		{
			/* ===== STATE ===== */

			this.level = 'All';
			this.action = '';
			this.items = [];
			this.refreshing = false;
			this.alive = true;
			this.generation = 0;

			this.levels =
			[
				{ id: 'All',   label: 'All',   icon: 'filter_list' },
				{ id: 'Info',  label: 'Info',  icon: 'info' },
				{ id: 'Warn',  label: 'Warn',  icon: 'warning' },
				{ id: 'Error', label: 'Error', icon: 'error' }
			];

			/* ===== FETCH ===== */

			this.fetch = async () =>
			{
				const gen = ++this.generation;

				this.refreshing = true;

				const query = logs.Find()
					.sort('created_at', 'desc')
					.limit(200);

				if(this.target_type)
				{
					query.filter('target_type', this.target_type);
				}

				if(this.target_id)
				{
					query.filter('target_id', this.target_id);
				}

				if(this.correlation_id)
				{
					query.filter('correlation_id', this.correlation_id);
				}

				if(this.level !== 'All')
				{
					query.filter('level', this.level);
				}

				if(this.action.trim())
				{
					query.filter('action', this.action.trim(), 'ILIKE');
				}

				const list = await query.many();

				if(gen !== this.generation)
				{
					return;
				}

				const rows = list.map((item) => item.GetData());

				/* Collect referenced IDs per type from target_* and reference_* fields. */

				const ids = { Server: new Set(), Script: new Set(), Package: new Set(), Service: new Set() };

				for(const row of rows)
				{
					if(row.target_type && row.target_id && ids[row.target_type])
					{
						ids[row.target_type].add(row.target_id);
					}

					if(row.reference_type && row.reference_id && ids[row.reference_type])
					{
						ids[row.reference_type].add(row.reference_id);
					}
				}

				/* Resolve each type in parallel — one query per addon with an IN filter. */

				const queries = [];

				if(ids.Server.size)
				{
					queries.push(servers.Find().filter('id', [...ids.Server], 'IN').select(['id', 'name', 'status']).limit(1000).many().then((entities) => ({ type: 'Server', entities })));
				}

				if(ids.Script.size)
				{
					queries.push(scripts.Find().filter('id', [...ids.Script], 'IN').select(['id', 'name']).limit(1000).many().then((entities) => ({ type: 'Script', entities })));
				}

				if(ids.Package.size)
				{
					queries.push(packages.Find().filter('id', [...ids.Package], 'IN').select(['id', 'name']).limit(1000).many().then((entities) => ({ type: 'Package', entities })));
				}

				if(ids.Service.size)
				{
					queries.push(services.Find().filter('id', [...ids.Service], 'IN').select(['id', 'name']).limit(1000).many().then((entities) => ({ type: 'Service', entities })));
				}

				const results = await Promise.all(queries);

				if(gen !== this.generation)
				{
					return;
				}

				/* Build lookup map: { Server: { 30: {...} }, ... } */

				const lookup = { Server: {}, Script: {}, Package: {}, Service: {} };

				for(const { type, entities } of results)
				{
					for(const entity of entities)
					{
						const data = entity.GetData();
						lookup[type][data.id] = data;
					}
				}

				/* Attach resolved entities back onto each row as target_<type> / reference_<type>. */

				for(const row of rows)
				{
					if(row.target_type && row.target_id && lookup[row.target_type])
					{
						row['target_' + row.target_type.toLowerCase()] = lookup[row.target_type][row.target_id];
					}

					if(row.reference_type && row.reference_id && lookup[row.reference_type])
					{
						row['reference_' + row.reference_type.toLowerCase()] = lookup[row.reference_type][row.reference_id];
					}
				}

				this.items = rows;
				this.groups = this.group(this.items);
				this.refreshing = false;
			};

			/* ===== GROUPING ===== */

			/* Groups by correlation_id. Rows without correlation_id become solo entries.
			   Each group keeps its latest timestamp so the list stays sorted newest-first. */

			this.group = (items) =>
			{
				const map = new Map();
				const solo = [];

				for(const item of items)
				{
					if(!item.correlation_id)
					{
						solo.push({ key: 'solo-' + item.id, items: [item], latest: item.created_at });
						continue;
					}

					const key = item.correlation_id;
					const existing = map.get(key);

					if(existing)
					{
						existing.items.push(item);

						if(item.created_at > existing.latest)
						{
							existing.latest = item.created_at;
						}
					}
					else
					{
						map.set(key, { key, correlation_id: item.correlation_id, items: [item], latest: item.created_at });
					}
				}

				const groups = [...map.values(), ...solo];

				/* Sort items inside each group ASC so they read top-to-bottom chronologically. */

				for(const group of groups)
				{
					group.items.sort((a, b) => (a.created_at < b.created_at ? -1 : (a.created_at > b.created_at ? 1 : 0)));
				}

				/* Sort groups DESC by latest timestamp. */

				groups.sort((a, b) => (a.latest < b.latest ? 1 : (a.latest > b.latest ? -1 : 0)));

				return groups;
			};

			/* ===== LOOP ===== */

			this.loop = async () =>
			{
				while(this.alive)
				{
					try
					{
						await this.fetch();
					}
					catch(error)
					{
						console.warn('Logs refresh failed:', error.message);
					}

					await new Promise((resolve) => setTimeout(resolve, 5000));
				}
			};

			this.OnReady(() =>
			{
				this.loop();
			});

			this.OnDestroy(() =>
			{
				this.alive = false;
			});

			/* ===== HANDLERS ===== */

			this.changeLevel = ({ value }) =>
			{
				this.level = value;
				this.items = [];
				this.groups = [];
				this.fetch();
			};

			this.changeAction = ({ value }) =>
			{
				this.action = value || '';
				this.items = [];
				this.groups = [];
				this.fetch();
			};

			this.groups = [];

			/* ===== RENDER ===== */

			return /* html */ `
				<div class="box">
					<div class="toolbar">
						<div class="filter">
							<span class="filter-label">Level</span>
							<e-navigation-tabs
								:items="levels"
								:active="level"
								:_change="changeLevel"
								tone="pills"
								size="s"
							></e-navigation-tabs>
						</div>

						<div class="filter filter-action">
							<span class="filter-label">Action</span>
							<e-form-input
								:value="action"
								placeholder="e.g. packages.install"
								size="s"
								icon="search"
								:_change="changeAction"
							></e-form-input>
						</div>

						<div class="status">
							<span :class="'dot ' + (refreshing ? 'on' : '')"></span>
							<span class="status-label">{{ refreshing ? 'Refreshing' : 'Live' }}</span>
						</div>
					</div>

					<e-status-empty
						ot-if="groups.length === 0"
						icon="description"
						title="No logs yet"
						description="Run a script, connect an agent, or trigger any action to see events here."
					></e-status-empty>

					<div ot-if="groups.length > 0" class="list">
						<div ot-for="group in groups" :class="group.items.length > 1 ? 'group multi' : 'group'">
							<div ot-if="group.items.length > 1" class="group-head">
								<i>link</i>
								<span class="group-label">Flow</span>
								<span class="group-id">{{ group.correlation_id }}</span>
								<span class="group-count">{{ group.items.length }} events</span>
							</div>

							<e-log ot-for="item in group.items" :item="item"></e-log>
						</div>
					</div>
				</div>
			`;
		}
	});
});
