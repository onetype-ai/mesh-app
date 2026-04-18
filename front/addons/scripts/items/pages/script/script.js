onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'script',
		route: '/scripts/:id',
		title: 'Script',
		grid:
		{
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function(parameters)
		{
			const item = await scripts.Find()
				.filter('id', parameters.id)
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
				this.crumbs =
				[
					{ icon: 'terminal', label: 'Scripts', href: '/scripts' },
					{ label: (data.script && data.script.name) || '—' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data })
			{
				this.script = data.script;
				this.hasMetrics = !!(this.script && this.script.metrics && this.script.metrics.length);

				return /* html */ `
					<div class="ot-flex-vertical ot-gap-l">
						<e-script-header :item="script"></e-script-header>

						<div class="ot-container-l ot-pb-l script-body">
							<div class="script-main">
								<e-global-heading
									title="Bash"
									description="The command that runs on every server this script targets."
									size="m"
								></e-global-heading>

								<e-global-code
									:source="script.bash"
									language="bash"
									:lines="true"
									filename="script.sh"
									background="bg-2"
									size="m"
								></e-global-code>
							</div>

							<div ot-if="hasMetrics" class="script-side">
								<e-global-heading
									title="Metrics"
									description="Widgets this script declares."
									size="m"
								></e-global-heading>

								<e-script-metrics :config="script.metrics"></e-script-metrics>
							</div>
						</div>
					</div>
				`;
			}
		}
	});
});
