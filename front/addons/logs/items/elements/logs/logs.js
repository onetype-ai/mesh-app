onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'logs',
		config:
		{
			server:
			{
				type: 'string',
				value: '',
				description: 'Optional server_id to scope logs to one server.'
			},
			script:
			{
				type: 'string',
				value: '',
				description: 'Optional script_id to scope logs to one script.'
			}
		},
		render: function()
		{
			/* ===== STATE ===== */

			this.level = 'All';
			this.source = 'All';
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

			this.sources =
			[
				{ id: 'All',    label: 'All',    icon: 'filter_list' },
				{ id: 'Agent',  label: 'Agent',  icon: 'dns' },
				{ id: 'Script', label: 'Script', icon: 'terminal' },
				{ id: 'System', label: 'System', icon: 'settings' }
			];

			/* ===== FETCH ===== */

			this.fetch = async () =>
			{
				const gen = ++this.generation;

				this.refreshing = true;

				const query = logs.Find()
					.sort('created_at', 'desc')
					.limit(200)
					.join('servers', 'server_id', 'server', (join) => join.select(['id', 'name']))
					.join('scripts', 'script_id', 'script', (join) => join.select(['id', 'name']));

				if(this.server)
				{
					query.filter('server_id', this.server);
				}

				if(this.script)
				{
					query.filter('script_id', this.script);
				}

				if(this.level !== 'All')
				{
					query.filter('level', this.level);
				}

				if(this.source !== 'All')
				{
					query.filter('source', this.source);
				}

				const list = await query.many();

				if(gen !== this.generation)
				{
					return;
				}

				this.items = list.map((item) => item.data);
				this.refreshing = false;
			};

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
				this.fetch();
			};

			this.changeSource = ({ value }) =>
			{
				this.source = value;
				this.items = [];
				this.fetch();
			};

			/* ===== HELPERS ===== */

			this.isEmpty = () => this.items.length === 0;

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

						<div class="filter">
							<span class="filter-label">Source</span>
							<e-navigation-tabs
								:items="sources"
								:active="source"
								:_change="changeSource"
								tone="pills"
								size="s"
							></e-navigation-tabs>
						</div>

						<div class="status">
							<span :class="'dot ' + (refreshing ? 'on' : '')"></span>
							<span class="status-label">{{ refreshing ? 'Refreshing' : 'Live' }}</span>
						</div>
					</div>

					<e-status-empty
						ot-if="isEmpty()"
						icon="description"
						title="No logs yet"
						description="Run a script or connect an agent to see events here."
					></e-status-empty>

					<div ot-if="!isEmpty()" class="list">
						<e-log
							ot-for="item in items"
							:item="item"
							:server="item.server"
							:script="item.script"
						></e-log>
					</div>
				</div>
			`;
		}
	});
});
