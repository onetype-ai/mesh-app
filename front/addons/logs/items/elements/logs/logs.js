onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'logs',
		config:
		{
			items:
			{
				type: 'array',
				value: [],
				description: 'Log rows from logs addon.'
			},
			servers:
			{
				type: 'array',
				value: [],
				description: 'Servers list used to resolve server_id → name.'
			},
			scripts:
			{
				type: 'array',
				value: [],
				description: 'Scripts list used to resolve script_id → name.'
			},
			refreshing:
			{
				type: 'boolean',
				value: false,
				description: 'Whether the parent is currently fetching new logs.'
			}
		},
		render: function()
		{
			/* ===== STATE ===== */

			this.level = 'All';
			this.source = 'All';

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

			/* ===== HANDLERS ===== */

			this.changeLevel = ({ value }) =>
			{
				this.level = value;
			};

			this.changeSource = ({ value }) =>
			{
				this.source = value;
			};

			/* ===== DERIVED (from props) ===== */

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
				return item.server_id ? (this.serversById[item.server_id] || null) : null;
			};

			this.resolveScript = (item) =>
			{
				return item.script_id ? (this.scriptsById[item.script_id] || null) : null;
			};

			this.filter = () =>
			{
				return this.items.filter((item) =>
				{
					if(this.level !== 'All' && item.level !== this.level) return false;
					if(this.source !== 'All' && item.source !== this.source) return false;
					return true;
				});
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

					<e-status-empty
						ot-if="!isEmpty() && filter().length === 0"
						icon="filter_list_off"
						title="No matches"
						description="No logs match the current filters."
					></e-status-empty>

					<div ot-if="filter().length > 0" class="list">
						<e-log
							ot-for="item in filter()"
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
