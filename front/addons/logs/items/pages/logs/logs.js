onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'logs',
		route: '/logs',
		title: 'Logs',
		grid:
		{
			template: '"sidebar navbar" "sidebar main"',
			columns: '68px 1fr',
			rows: 'auto 1fr',
			gap: '0'
		},
		data: async function()
		{
			const [logsList, serversList, scriptsList] = await Promise.all([
				logs.Find()
					.sort('created_at', 'desc')
					.limit(200)
					.many(),
				servers.Find()
					.select(['id', 'name'])
					.limit(1000)
					.many(),
				scripts.Find()
					.select(['id', 'name'])
					.limit(1000)
					.many()
			]);

			return {
				items: logsList.map((item) => item.data),
				servers: serversList.map((item) => item.data),
				scripts: scriptsList.map((item) => item.data)
			};
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
					{ icon: 'description', label: 'Logs' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function({ data })
			{
				this.items = data.items;
				this.servers = data.servers;
				this.scripts = data.scripts;
				this.refreshing = false;
				this.alive = true;

				this.fetch = async () =>
				{
					this.refreshing = true;

					const list = await logs.Find()
						.sort('created_at', 'desc')
						.limit(200)
						.many();

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

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<e-global-heading
							title="Logs"
							description="Every script run, every agent event, every system change — in one feed."
							size="m"
						></e-global-heading>

						<e-logs
							:items="items"
							:servers="servers"
							:scripts="scripts"
							:refreshing="refreshing"
						></e-logs>
					</div>
				`;
			}
		}
	});
});
