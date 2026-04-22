onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'server-card',
		icon: 'dns',
		name: 'Server Card',
		description: 'Horizontal premium server card with live system metrics.',
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
				value: 'm',
				options: ['s', 'm', 'l'],
				description: 'Card size.'
			},
			background:
			{
				type: 'string',
				value: 'bg-2',
				options: ['bg-1', 'bg-2', 'bg-3', 'bg-4'],
				description: 'Background depth.'
			},
			variant:
			{
				type: 'array',
				value: ['border', 'hover-lift'],
				each: { type: 'string' },
				options: ['border', 'hover-lift'],
				description: 'Visual modifiers.'
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

				if(item.is_connected === true)
				{
					this.accent = 'green';
				}
				else
				{
					this.accent = 'neutral';
				}

				const os = staticData.os ? staticData.os : {};
				const network = staticData.network ? staticData.network : {};

				this.identity =
				{
					name: item.name ? item.name : '—',
					hostname: network.hostname ? network.hostname : '',
					os: (os.name ? os.name : '') + (os.version ? ' ' + os.version : '')
				};

				this.flags =
				{
					active: item.is_connected === true,
					rented: item.is_rented === true,
					hasSpecs: !!(staticData.cpu || staticData.ram || (staticData.disk && staticData.disk.length))
				};

				const cpu = staticData.cpu ? staticData.cpu : {};
				const ram = staticData.ram ? staticData.ram : {};
				const disks = staticData.disk ? staticData.disk : [];
				const gpus = staticData.gpu ? staticData.gpu : [];

				const specParts = [];

				if(cpu.cores)
				{
					specParts.push(cpu.cores + 'c');
				}

				if(ram.total)
				{
					specParts.push(this.formatBytes(ram.total));
				}

				const diskTotal = disks.reduce((sum, entry) => sum + (entry.total ? entry.total : 0), 0);

				if(diskTotal)
				{
					specParts.push(this.formatBytes(diskTotal));
				}

				if(gpus.length)
				{
					specParts.push(gpus.length + '× GPU');
				}

				this.specsLine = specParts.join(' · ');

				const cpuUsage = dynamicData.cpu && dynamicData.cpu.usage ? dynamicData.cpu.usage : 0;
				const ramDynamic = dynamicData.ram ? dynamicData.ram : {};
				const diskDynamic = dynamicData.disk ? dynamicData.disk : [];
				const gpuDynamic = dynamicData.gpu ? dynamicData.gpu : [];

				const diskUsed = diskDynamic.reduce((sum, entry) => sum + (entry.used ? entry.used : 0), 0);
				const diskFree = diskDynamic.reduce((sum, entry) => sum + (entry.free ? entry.free : 0), 0);
				const diskTotalDynamic = diskUsed + diskFree;

				const vramTotal = gpus.reduce((sum, entry) => sum + (entry.vram ? entry.vram : 0), 0);
				const vramUsed = gpuDynamic.reduce((sum, entry) => sum + (entry.vram_used ? entry.vram_used : 0), 0);

				this.bars =
				[
					{
						key: 'cpu',
						label: 'CPU',
						value: Math.round(cpuUsage),
						color: 'brand'
					},
					{
						key: 'ram',
						label: 'RAM',
						value: ram.total ? Math.round((ramDynamic.used ? ramDynamic.used : 0) / ram.total * 100) : 0,
						color: 'blue'
					},
					{
						key: 'disk',
						label: 'DISK',
						value: diskTotalDynamic ? Math.round(diskUsed / diskTotalDynamic * 100) : 0,
						color: 'green'
					}
				];

				if(vramTotal > 0)
				{
					this.bars.push({
						key: 'vram',
						label: 'VRAM',
						value: Math.round(vramUsed / vramTotal * 100),
						color: 'orange'
					});
				}

				this.uptime = this.formatUptime(dynamicData.uptime);

				this.slots =
				{
					tags: this.Slots.tags ? true : false,
					actions: this.Slots.actions ? true : false
				};
			});

			/* ===== CLASSES ===== */

			this.classes = () =>
			{
				const list = ['box', this.background, 'size-' + this.size, 'accent-' + this.accent];

				this.variant.forEach((modifier) =>
				{
					list.push(modifier);
				});

				if(!this.flags.active)
				{
					list.push('inactive');
				}

				return list.join(' ');
			};

			/* ===== RENDER ===== */

			return /* html */ `
				<article :class="classes()">
					<div :class="'icon ' + accent">
						<i>dns</i>
						<span :class="'pulse ' + (flags.active ? 'on' : 'off')"></span>
					</div>

					<div class="identity">
						<div class="title-row">
							<h3 class="name">{{ identity.name }}</h3>

							<span ot-if="identity.hostname" class="hostname">{{ identity.hostname }}</span>

							<span ot-if="flags.rented" class="rented" ot-tooltip="{ text: 'Rented from marketplace', position: { x: 'center', y: 'top' } }">
								<i>storefront</i>
							</span>
						</div>

						<div class="sub">
							<span ot-if="identity.os" class="os">{{ identity.os }}</span>
							<span ot-if="identity.os && specsLine" class="dot-sep"></span>
							<span ot-if="specsLine" class="specs-line">{{ specsLine }}</span>
							<span ot-if="uptime" class="dot-sep"></span>
							<span ot-if="uptime" class="uptime">
								<i>schedule</i>
								<span>{{ uptime }}</span>
							</span>
						</div>

						<div ot-if="slots.tags" class="tags">
							<slot name="tags"></slot>
						</div>
					</div>

					<div ot-if="flags.hasSpecs" class="bars">
						<div ot-for="bar in bars" :class="'bar bar-' + bar.color">
							<span class="bar-label">{{ bar.label }}</span>
							<div class="bar-track">
								<div class="bar-fill" :style="'width: ' + bar.value + '%'"></div>
							</div>
							<span class="bar-value">{{ bar.value }}%</span>
						</div>
					</div>

					<div ot-if="slots.actions" class="actions">
						<slot name="actions"></slot>
					</div>
				</article>
			`;
		}
	});
});
