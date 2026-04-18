onetype.AddonReady('pages', (pages) =>
{
	pages.Item({
		id: 'home',
		route: '/',
		title: 'Mesh',
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
					{ icon: 'grid_view', label: 'Dashboard' }
				];

				return `<e-navbar :crumbs="crumbs"></e-navbar>`;
			},
			main: function()
			{
				/* ===== Sparkline datasets ===== */
				const sparkCpu = [32, 28, 34, 40, 45, 42, 38, 41, 46, 52, 48, 51, 47, 43];
				const sparkRam = [60, 58, 62, 65, 63, 68, 72, 70, 75, 73, 71, 69, 74, 73];
				const sparkDisk = [42, 42, 43, 43, 44, 45, 46, 46, 47, 48, 48, 49, 49, 50];
				const sparkNet = [120, 180, 140, 220, 260, 300, 280, 320, 290, 350, 410, 380, 420, 450];
				const sparkExec = [5, 8, 12, 18, 24, 32, 28, 35, 42, 38, 48, 52, 45, 50];
				const sparkUp = [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2];

				this.hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

				this.resourceSeries =
				[
					{ label: 'CPU', color: 'brand', values: [28, 32, 30, 35, 42, 48, 55, 52, 49, 45, 40, 38] },
					{ label: 'RAM', color: 'blue', values: [60, 62, 58, 64, 68, 72, 75, 73, 71, 69, 67, 65] },
					{ label: 'Disk', color: 'green', values: [42, 42, 43, 43, 44, 45, 46, 46, 47, 48, 48, 49] }
				];

				this.networkSeries =
				[
					{ label: 'RX', color: 'blue', values: [120, 180, 240, 220, 310, 380, 420, 390, 440, 520, 480, 510] },
					{ label: 'TX', color: 'orange', values: [80, 110, 140, 160, 210, 250, 280, 260, 290, 340, 310, 330] }
				];

				this.perServerSeries =
				[
					{ label: 'Ryzen Beast', color: 'brand', values: [18, 22, 30, 28, 35, 45, 52, 48, 42, 40, 35, 32] },
					{ label: 'Linux Box', color: 'green', values: [3, 4, 5, 6, 8, 10, 12, 11, 9, 8, 6, 5] }
				];

				this.packageBars =
				[
					{ label: 'Git', value: 2, color: 'green' },
					{ label: 'Docker', value: 1, color: 'orange' },
					{ label: 'NVIDIA', value: 1, color: 'blue' },
					{ label: 'Node', value: 0, color: 'red' }
				];

				this.fleetHealth =
				[
					{ label: 'Healthy', value: 2, color: 'green' },
					{ label: 'Warning', value: 0, color: 'orange' },
					{ label: 'Offline', value: 0, color: 'red' }
				];

				this.execBars =
				[
					{ label: '00h', value: 12, color: 'brand' },
					{ label: '04h', value: 8, color: 'brand' },
					{ label: '08h', value: 24, color: 'brand' },
					{ label: '12h', value: 32, color: 'brand' },
					{ label: '16h', value: 28, color: 'brand' },
					{ label: '20h', value: 18, color: 'brand' }
				];

				this.topServerLoad =
				[
					{ label: 'Ryzen Beast', value: 81, color: 'brand' },
					{ label: 'Linux Box', value: 31, color: 'blue' }
				];

				/* ===== Hero ===== */
				this.heroLabel = 'Fleet capacity';
				this.heroValue = '47%';
				this.heroDescription = 'Weighted CPU across 2 active servers, last 24h.';
				this.heroIcon = 'memory';
				this.heroIconColor = 'brand';
				this.heroDelta = { value: '+12%', label: 'vs yesterday', direction: 'up' };
				this.heroSpark = sparkCpu;

				/* ===== Tiles ===== */
				this.tiles =
				[
					{ label: 'Online', value: '2', icon: 'dns', iconColor: 'green', delta: { value: '+1', direction: 'up' }, sparkline: sparkUp, sparklineColor: 'green', sparklineType: 'bar' },
					{ label: 'Memory', value: '22.7 GB', icon: 'database', iconColor: 'blue', delta: { value: '-3%', direction: 'down' }, sparkline: sparkRam, sparklineColor: 'blue', sparklineType: 'area' },
					{ label: 'Network', value: '450 MB/s', icon: 'lan', iconColor: 'orange', delta: { value: '+22%', direction: 'up' }, sparkline: sparkNet, sparklineColor: 'orange', sparklineType: 'area' },
					{ label: 'Disk', value: '50%', icon: 'hard_drive_2', iconColor: 'green', delta: { value: '+1%', direction: 'up' }, sparkline: sparkDisk, sparklineColor: 'green', sparklineType: 'line' },
					{ label: 'Uptime', value: '99.9%', icon: 'schedule', iconColor: 'brand', delta: { value: '7d', direction: 'neutral' }, sparkline: sparkUp, sparklineColor: 'brand', sparklineType: 'bar' },
					{ label: 'Exec/h', value: '32', icon: 'terminal', iconColor: 'brand', delta: { value: '+14%', direction: 'up' }, sparkline: sparkExec, sparklineColor: 'brand', sparklineType: 'bar' }
				];

				return /* html */ `
					<div class="ot-container-l ot-py-l ot-flex-vertical">
						<div class="dashboard-hero">
							<e-cards-stat
								:label="heroLabel"
								:value="heroValue"
								:description="heroDescription"
								:icon="heroIcon"
								:iconColor="heroIconColor"
								:delta="heroDelta"
								:sparkline="heroSpark"
								sparklineColor="brand"
								sparklineType="area"
								size="l"
								background="bg-2"
								:variant="['border']"
							></e-cards-stat>

							<div class="dashboard-hero-side">
								<e-cards-stat
									label="Servers online"
									value="2"
									description="Of 2 registered in your fleet."
									icon="dns"
									iconColor="green"
									:delta="{ value: '+1', label: 'this week', direction: 'up' }"
									:sparkline="[1,1,1,2,2,2,2,2,2,2,2,2,2,2]"
									sparklineColor="green"
									sparklineType="bar"
									size="m"
									background="bg-2"
									:variant="['border']"
								></e-cards-stat>

								<e-cards-stat
									label="Network throughput"
									value="450 MB/s"
									description="Combined RX + TX across fleet."
									icon="lan"
									iconColor="orange"
									:delta="{ value: '+22%', label: 'vs 24h', direction: 'up' }"
									:sparkline="[120,180,140,220,260,300,280,320,290,350,410,380,420,450]"
									sparklineColor="orange"
									sparklineType="area"
									size="m"
									background="bg-2"
									:variant="['border']"
								></e-cards-stat>
							</div>
						</div>

						<div class="dashboard-tiles">
							<e-cards-stat
								ot-for="tile in tiles"
								:label="tile.label"
								:value="tile.value"
								:icon="tile.icon"
								:iconColor="tile.iconColor"
								:delta="tile.delta"
								:sparkline="tile.sparkline"
								:sparklineColor="tile.sparklineColor"
								:sparklineType="tile.sparklineType"
								background="bg-2"
								:variant="['border']"
							></e-cards-stat>
						</div>

						<div class="dashboard-main">
							<e-charts-line
								title="Resource usage"
								description="Weighted CPU, RAM and Disk across fleet — last 24h."
								:series="resourceSeries"
								:labels="hours"
								:height="300"
								:smooth="true"
								:fill="true"
								:showDots="false"
								background="bg-2"
								size="m"
							></e-charts-line>

							<div class="dashboard-main-side">
								<e-charts-bar
									title="Fleet health"
									:items="fleetHealth"
									orientation="horizontal"
									:height="120"
									:showGrid="false"
									background="bg-2"
									size="s"
								></e-charts-bar>

								<e-charts-bar
									title="Package coverage"
									description="Servers per package."
									:items="packageBars"
									orientation="horizontal"
									:height="180"
									:showGrid="false"
									background="bg-2"
									size="s"
								></e-charts-bar>
							</div>
						</div>

						<div class="dashboard-row">
							<e-charts-line
								title="CPU by server"
								description="Per-server load across the last 24h."
								:series="perServerSeries"
								:labels="hours"
								:height="220"
								:smooth="true"
								:fill="false"
								:showDots="false"
								background="bg-2"
								size="m"
							></e-charts-line>

							<e-charts-bar
								title="Current RAM load"
								description="% used per server."
								:items="topServerLoad"
								:height="220"
								background="bg-2"
								size="m"
							></e-charts-bar>
						</div>

						<div class="dashboard-row">
							<e-charts-line
								title="Network traffic"
								description="RX / TX across all servers (MB/s)."
								:series="networkSeries"
								:labels="hours"
								:height="220"
								:smooth="true"
								:fill="true"
								:showDots="false"
								background="bg-2"
								size="m"
							></e-charts-line>

							<e-charts-bar
								title="Script executions"
								description="Commands per 4h window."
								:items="execBars"
								:height="220"
								background="bg-2"
								size="m"
							></e-charts-bar>
						</div>
					</div>
				`;
			}
		}
	});
});
