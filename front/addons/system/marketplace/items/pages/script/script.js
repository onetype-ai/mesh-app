onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'marketplace-script',
		route: '/marketplace/scripts/:id',
		title: 'Script — Marketplace',
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
				.filter('is_marketplace', true)
				.filter('status', 'Published')
				.one();

			if(!item)
			{
				return $ot.page('/404');
			}

			return { script: item.GetData() };
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
					{ icon: 'storefront', label: 'Marketplace', href: '/marketplace' },
					{ label: 'Scripts', href: '/marketplace/scripts' },
					{ label: data.script.name }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data })
			{
				this.script = data.script;
				this.importing = false;

				this.json = (object) =>
				{
					if(!object || !Object.keys(object).length)
					{
						return '';
					}

					return JSON.stringify(object, null, 2);
				};

				this.hasObject = (object) =>
				{
					return object && Object.keys(object).length > 0;
				};

				this.handleImport = async () =>
				{
					const confirmed = await $ot.confirm(
						'Import ' + this.script.name,
						'A private copy will be added to your library. You can run, edit and install it on your servers anytime.',
						{ confirm: 'Import to library', cancel: 'Cancel', color: 'green' }
					);

					if(!confirmed)
					{
						return;
					}

					this.importing = true;

					await $ot.command('marketplace:script:import', { script_id: this.script.id });

					this.importing = false;
				};

				return /* html */ `
					<div class="ot-flex-vertical ot-gap-l">
						<e-script-header :item="script">
							<div slot="right">
								<e-form-button
									text="Import"
									icon="download"
									color="green"
									tone="solid"
									size="m"
									:loading="importing"
									:_click="handleImport"
								></e-form-button>
							</div>
						</e-script-header>

						<div class="ot-container-m ot-pb-l ot-flex-vertical ot-gap-l">
							<div class="ot-flex-vertical ot-gap-m">
								<e-global-heading title="Bash" description="The command that runs on every server this script targets." size="s"></e-global-heading>
								<e-global-code
									:source="script.bash"
									language="bash"
									:lines="true"
									filename="script.sh"
									background="bg-2"
									size="m"
								></e-global-code>
							</div>

							<div ot-if="hasObject(script.config)" class="ot-flex-vertical ot-gap-m">
								<e-global-heading title="Config" description="Configurable parameters this script accepts." size="s"></e-global-heading>
								<e-global-code
									:source="json(script.config)"
									language="json"
									:lines="true"
									filename="config.json"
									background="bg-2"
									size="m"
								></e-global-code>
							</div>

							<div ot-if="hasObject(script.metrics)" class="ot-flex-vertical ot-gap-m">
								<e-global-heading title="Metrics" description="Widgets this script declares." size="s"></e-global-heading>
								<e-global-code
									:source="json(script.metrics)"
									language="json"
									:lines="true"
									filename="metrics.json"
									background="bg-2"
									size="m"
								></e-global-code>
							</div>
						</div>
					</div>
				`;
			}
		}
	});
});
