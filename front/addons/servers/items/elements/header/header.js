onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'server-header',
		icon: 'dns',
		name: 'Server Header',
		description: 'Premium hero for a server detail page.',
		category: 'Servers',
		config:
		{
			item:
			{
				type: 'object',
				value: null,
				description: 'Server row from servers addon.'
			},
			size:
			{
				type: 'string',
				value: 'l',
				options: ['m', 'l'],
				description: 'Header scale.'
			}
		},
		render: function()
		{
			/* ===== FORMATTERS ===== */

			this.formatBytes = (bytes) =>
			{
				if(!bytes) return '—';

				const units = ['B', 'KB', 'MB', 'GB', 'TB'];
				let index = 0;
				let value = bytes;

				while(value >= 1024 && index < units.length - 1)
				{
					value /= 1024;
					index++;
				}

				return (value < 10 ? value.toFixed(1) : Math.round(value)) + ' ' + units[index];
			};

			this.formatUptime = (seconds) =>
			{
				if(!seconds) return '';

				const days = Math.floor(seconds / 86400);
				const hours = Math.floor((seconds % 86400) / 3600);

				if(days > 0) return days + 'd ' + hours + 'h';
				if(hours > 0) return hours + 'h';

				return Math.floor(seconds / 60) + 'm';
			};

			/* ===== DERIVED ===== */

			this.Compute(() =>
			{
				const item = this.item;
				const staticData = item.system_static ? item.system_static : {};
				const dynamicData = item.system_dynamic ? item.system_dynamic : {};

				if(!item.is_initialized)
				{
					this.accent = 'orange';
				}
				else if(item.status === 'Active')
				{
					this.accent = 'green';
				}
				else
				{
					this.accent = 'neutral';
				}

				if(!item.is_initialized)
				{
					this.status = { label: 'Not configured', icon: 'rocket_launch' };
				}
				else if(item.status === 'Active')
				{
					this.status = { label: 'Active', icon: 'radio_button_checked' };
				}
				else
				{
					this.status = { label: 'Inactive', icon: 'radio_button_unchecked' };
				}

				const os = staticData.os ? staticData.os : {};
				const network = staticData.network ? staticData.network : {};

				this.identity =
				{
					name: item.name ? item.name : '—',
					hostname: network.hostname ? network.hostname : '',
					ip: network.ip ? network.ip : ''
				};

				this.flags =
				{
					rented: item.is_rented === true,
					initialized: item.is_initialized === true,
					active: item.status === 'Active'
				};

				const cpu = staticData.cpu ? staticData.cpu : {};
				const ram = staticData.ram ? staticData.ram : {};
				const disks = staticData.disk ? staticData.disk : [];
				const gpus = staticData.gpu ? staticData.gpu : [];

				this.specs =
				{
					os: (os.name ? os.name : '') + (os.version ? ' ' + os.version : ''),
					cpu: cpu.model ? cpu.model : '',
					cores: cpu.cores ? cpu.cores : 0,
					ram: this.formatBytes(ram.total),
					disk: this.formatBytes(disks.reduce((sum, entry) => sum + (entry.total ? entry.total : 0), 0)),
					gpuCount: gpus.length,
					gpuModel: gpus.length && gpus[0].model ? gpus[0].model : ''
				};

				const cpuUsage = dynamicData.cpu && dynamicData.cpu.usage ? dynamicData.cpu.usage : 0;
				const ramDynamic = dynamicData.ram ? dynamicData.ram : {};
				const diskDynamic = dynamicData.disk ? dynamicData.disk : [];
				const gpuDynamic = dynamicData.gpu ? dynamicData.gpu : [];

				const diskUsed = diskDynamic.reduce((sum, entry) => sum + (entry.used ? entry.used : 0), 0);
				const diskFree = diskDynamic.reduce((sum, entry) => sum + (entry.free ? entry.free : 0), 0);
				const diskTotal = diskUsed + diskFree;

				const vramTotal = gpus.reduce((sum, entry) => sum + (entry.vram ? entry.vram : 0), 0);
				const vramUsed = gpuDynamic.reduce((sum, entry) => sum + (entry.vram_used ? entry.vram_used : 0), 0);

				this.metrics =
				[
					{
						key: 'cpu',
						label: 'CPU',
						value: Math.round(cpuUsage),
						color: 'brand',
						icon: 'memory',
						sub: cpu.cores ? cpu.cores + ' cores' : ''
					},
					{
						key: 'ram',
						label: 'RAM',
						value: ram.total ? Math.round((ramDynamic.used ? ramDynamic.used : 0) / ram.total * 100) : 0,
						color: 'blue',
						icon: 'database',
						sub: ram.total ? this.formatBytes(ramDynamic.used ? ramDynamic.used : 0) + ' / ' + this.formatBytes(ram.total) : ''
					},
					{
						key: 'disk',
						label: 'DISK',
						value: diskTotal ? Math.round(diskUsed / diskTotal * 100) : 0,
						color: 'green',
						icon: 'hard_drive_2',
						sub: diskTotal ? this.formatBytes(diskUsed) + ' / ' + this.formatBytes(diskTotal) : ''
					}
				];

				if(vramTotal > 0)
				{
					this.metrics.push({
						key: 'vram',
						label: 'VRAM',
						value: Math.round(vramUsed / vramTotal * 100),
						color: 'orange',
						icon: 'developer_board',
						sub: this.formatBytes(vramUsed * 1024 * 1024) + ' / ' + this.formatBytes(vramTotal * 1024 * 1024)
					});
				}

				this.uptime = this.formatUptime(dynamicData.uptime);

				this.slots =
				{
					tags: this.Slots.tags ? true : false,
					right: this.Slots.right ? true : false
				};
			});

			/* ===== CLASSES ===== */

			this.classes = () =>
			{
				const list = ['box', 'size-' + this.size, 'accent-' + this.accent];

				return list.join(' ');
			};

			/* ===== RENDER ===== */

			return /* html */ `
				<section :class="classes()">
					<div class="aurora"></div>
					<div class="grid"></div>
					<div class="noise"></div>

					<div class="body">
						<div class="split">
							<div class="side-left">
								<div class="head">
									<div :class="'icon ' + accent">
										<i>dns</i>
										<span :class="'pulse ' + (flags.active ? 'on' : 'off')"></span>
									</div>

									<div class="head-text">
										<div class="title-row">
											<h1 class="name">{{ identity.name }}</h1>

											<span :class="'status status-' + accent">
												<i>{{ status.icon }}</i>
												<span>{{ status.label }}</span>
											</span>

											<span ot-if="flags.rented" class="status status-blue">
												<i>storefront</i>
												<span>Rented</span>
											</span>
										</div>

										<div class="sub">
											<span ot-if="identity.hostname" class="hostname">{{ identity.hostname }}</span>
											<span ot-if="identity.hostname && identity.ip" class="dot-sep"></span>
											<span ot-if="identity.ip" class="ip">{{ identity.ip }}</span>
											<span ot-if="uptime" class="dot-sep"></span>
											<span ot-if="uptime" class="uptime">
												<i>schedule</i>
												<span>Up {{ uptime }}</span>
											</span>
										</div>
									</div>

									<div ot-if="slots.right" class="right">
										<slot name="right"></slot>
									</div>
								</div>

								<div ot-if="specs.cpu || specs.ram !== '—' || specs.disk !== '—' || specs.gpuCount || specs.os" class="specs">
									<span ot-if="specs.cpu" class="spec">
										<i>memory</i>
										<span class="spec-label">{{ specs.cpu }}</span>
										<span ot-if="specs.cores" class="spec-value">{{ specs.cores }}c</span>
									</span>

									<span ot-if="specs.ram !== '—'" class="spec">
										<i>database</i>
										<span class="spec-value">{{ specs.ram }}</span>
										<span class="spec-label">RAM</span>
									</span>

									<span ot-if="specs.disk !== '—'" class="spec">
										<i>hard_drive_2</i>
										<span class="spec-value">{{ specs.disk }}</span>
										<span class="spec-label">disk</span>
									</span>

									<span ot-if="specs.gpuCount" class="spec">
										<i>developer_board</i>
										<span class="spec-value">{{ specs.gpuCount }}×</span>
										<span ot-if="specs.gpuModel" class="spec-label">{{ specs.gpuModel }}</span>
										<span ot-if="!specs.gpuModel" class="spec-label">GPU</span>
									</span>

									<span ot-if="specs.os" class="spec">
										<i>terminal</i>
										<span class="spec-label">{{ specs.os }}</span>
									</span>
								</div>
							</div>

							<div class="side-right">
								<div class="bars">
									<div ot-for="metric in metrics" :class="'bar bar-' + metric.color">
										<span class="bar-label">{{ metric.label }}</span>
										<div class="bar-track">
											<div class="bar-fill" :style="'width: ' + metric.value + '%'"></div>
										</div>
										<span class="bar-value">{{ metric.value }}%</span>
									</div>
								</div>
							</div>
						</div>

						<div ot-if="slots.tags" class="tags">
							<slot name="tags"></slot>
						</div>
					</div>
				</section>
			`;
		}
	});
});
