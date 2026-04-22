onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'server-metrics',
		route: '/servers/:id/metrics',
		title: 'Metrics',
		grid:
		{
			template: '"sidebar navbar navbar" "sidebar server main"',
			columns: '68px 260px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function(parameters)
		{
			const server = await servers.Find().filter('id', parameters.id).one();

			const packageList = await packages.Find()
				.filter('id', server.Get('packages'), 'IN')
				.select(['id', 'name', 'script_status_id'])
				.many();

			const packageStatusIds = packageList
				.map((item) => item.Get('script_status_id'))
				.filter((id) => id);

			const allScriptIds = [...server.Get('scripts'), ...packageStatusIds];

			const scriptList = await scripts.Find()
				.filter('id', allScriptIds, 'IN')
				.sort('name', 'asc')
				.many();

			return {
				server: server.data,
				scripts: scriptList.map((item) => item.data)
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
					{ icon: 'dns', label: 'Servers', href: '/servers' },
					{ label: (data.server && data.server.name) || '—', href: '/servers/' + (data.server && data.server.id) },
					{ label: 'Metrics' }
				];

				return /* html */ `
					<e-navbar :crumbs="crumbs"></e-navbar>
				`;
			},
			server: function({ data })
			{
				this.server = data.server;

				return /* html */ `
					<e-server-sidebar :item="server"></e-server-sidebar>
				`;
			},
			main: function({ data })
			{
				this.values = (data.server && data.server.metrics) || {};
				this.sections = data.scripts.filter((script) => script.metrics && script.metrics.length);
				this.hasMetrics = this.sections.length > 0;

				this.tabs = this.sections.map((section) =>
				{
					return {
						id: String(section.id),
						label: section.name,
						icon: 'terminal'
					};
				});

				this.activeTab = this.tabs.length ? this.tabs[0].id : '';

				this.changeTab = ({ value }) =>
				{
					this.activeTab = value;
				};

				this.active = () =>
				{
					return this.sections.find((section) => String(section.id) === this.activeTab);
				};

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Metrics"
							description="Live data collected from this server — grouped by the script that produced it."
							size="m"
						></e-global-heading>

						<e-status-empty
							ot-if="!hasMetrics"
							icon="analytics"
							title="No metrics"
							description="This server has no scripts or packages that declare metric widgets yet."
						></e-status-empty>

						<e-navigation-tabs
							ot-if="hasMetrics"
							:items="tabs"
							:active="activeTab"
							:_change="changeTab"
							tone="pills"
							size="m"
						></e-navigation-tabs>

						<e-script-metrics
							ot-if="hasMetrics"
							:config="active().metrics"
							:values="values"
						></e-script-metrics>
					</div>
				`;
			}
		}
	});
});
