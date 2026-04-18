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
			this.servers = [];
			this.scripts = [];
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

				const query = logs.Find().sort('created_at', 'desc').limit(200);

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

			this.lookups = async () =>
			{
				const [serversList, scriptsList] = await Promise.all([
					servers.Find().select(['id', 'name']).limit(1000).many(),
					scripts.Find().select(['id', 'name']).limit(1000).many()
				]);

				this.servers = serversList.map((item) => item.data);
				this.scripts = scriptsList.map((item) => item.data);
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
				this.lookups();
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

			/* ===== DERIVED ===== */

			this.Compute(() =>
			{
				this.serversById = {};
				this.scriptsById = {};

				for(const server of this.servers)
				{
					this.serversById[server.id] = server;
				}

				for(const script of this.scripts)
				{
					this.scriptsById[script.id] = script;
				}
			});

			/* ===== HELPERS ===== */

			this.resolveServer = (item) =>
			{
				return item.server_id ? this.serversById[item.server_id] : null;
			};

			this.resolveScript = (item) =>
			{
				return item.script_id ? this.scriptsById[item.script_id] : null;
			};

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
							:server="resolveServer(item)"
							:script="resolveScript(item)"
						></e-log>
					</div>
				</div>
			`;
		}
	});
});
