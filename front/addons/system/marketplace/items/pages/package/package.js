onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'marketplace-package',
		route: '/marketplace/packages/:id',
		title: 'Package — Marketplace',
		grid:
		{
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function(parameters)
		{
			const item = await packages.Find()
				.filter('id', parameters.id)
				.filter('is_marketplace', true)
				.filter('status', 'Published')
				.one();

			if(!item)
			{
				return $ot.page('/404');
			}

			const list = await scripts.Find()
				.filter('package_id', item.Get('id'))
				.filter('is_marketplace', true)
				.filter('status', 'Published')
				.sort('name', 'asc')
				.limit(500)
				.many();

			return { package: item.data, scripts: list.map((script) => script.data) };
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
					{ label: 'Packages', href: '/marketplace/packages' },
					{ label: data.package.name }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data })
			{
				this.package = data.package;
				this.scripts = data.scripts;
				this.script = null;
				this.importing = false;

				this.buildMenu = () =>
				{
					return this.scripts.map((script) =>
					{
						return {
							type: 'action',
							id: script.id,
							value: script.id,
							label: script.name,
							description: script.description,
							icon: 'terminal',
							active: this.script ? String(this.script.id) === String(script.id) : false
						};
					});
				};

				this.menu = this.buildMenu();

				this.toggleScript = ({ value }) =>
				{
					if(this.script && String(this.script.id) === String(value))
					{
						this.script = null;
					}
					else
					{
						this.script = this.scripts.find((script) => String(script.id) === String(value));
					}

					this.menu = this.buildMenu();
				};

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
						'Import ' + this.package.name,
						'A private copy will be added to your library. You can install it on your servers and edit it anytime.',
						{ confirm: 'Import to library', cancel: 'Cancel', color: 'green' }
					);

					if(!confirmed)
					{
						return;
					}

					this.importing = true;

					this.Update();

					await $ot.command('marketplace:package:import', { package_id: this.package.id });

					this.importing = false;
				};

				return /* html */ `
					<div class="ot-flex-vertical ot-gap-l">
						<e-package-header :item="package">
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
						</e-package-header>

						<div class="ot-container-m ot-pb-l marketplace-body">
							<div class="marketplace-main">
								<e-global-markdown ot-if="!script && package.overview" :content="package.overview"></e-global-markdown>

								<div ot-if="script" class="ot-flex-vertical ot-gap-l">
									<e-global-heading
										:title="script.name"
										:description="script.description"
										size="s"
									></e-global-heading>

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

							<aside ot-if="scripts.length" class="marketplace-side">
								<e-global-heading
									title="Scripts"
									description="Click to preview the bash. Click again to close."
									size="s"
								></e-global-heading>

								<e-global-menu :items="menu" :_select="toggleScript"></e-global-menu>
							</aside>
						</div>
					</div>
				`;
			}
		}
	});
});
