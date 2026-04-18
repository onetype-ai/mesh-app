onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'server-card',
		config:
		{
			item:
			{
				type: 'object',
				value: null,
				description: 'Server row from servers addon.'
			},
			tag:
			{
				type: 'object',
				value: null,
				config:
				{
					label: ['string'],
					color:
					{
						type: 'string',
						options: ['brand', 'blue', 'green', 'red', 'orange']
					}
				},
				description: 'Optional status tag shown on the right side.'
			},
			metrics:
			{
				type: 'array',
				value: [],
				description: 'Metric widgets to render from server.metrics.'
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
				if(!seconds) return '—';

				const days = Math.floor(seconds / 86400);
				const hours = Math.floor((seconds % 86400) / 3600);

				if(days > 0) return days + 'd ' + hours + 'h';
				if(hours > 0) return hours + 'h';

				return Math.floor(seconds / 60) + 'm';
			};

			this.formatMetric = (value, widget) =>
			{
				if(value === undefined || value === null)
				{
					return '—';
				}

				if(widget.widget === 'badge')
				{
					return value === true ? 'Yes' : value === false ? 'No' : String(value);
				}

				return String(value);
			};

			/* ===== DERIVED ===== */

			this.Compute(() =>
			{
				const item = this.item || {};
				const metrics = item.metrics || {};

				const ramTotal = metrics['system.ram.total'] || 0;
				const ramUsed = metrics['system.ram.used'] || 0;
				const disks = metrics['system.disk'] || [];
				const diskUsage = metrics['system.disk.usage'] || [];
				const gpus = metrics['system.gpu'] || [];
				const gpuUsage = metrics['system.gpu.usage'] || [];

				const diskTotal = disks.reduce((sum, disk) => sum + (disk.total || 0), 0);
				const diskUsed = diskUsage.reduce((sum, disk) => sum + (disk.used || 0), 0);
				const diskFree = diskUsage.reduce((sum, disk) => sum + (disk.free || 0), 0);
				const diskDenom = diskUsed + diskFree;

				const vramTotal = gpus.reduce((sum, gpu) => sum + (gpu.vram || 0), 0);
				const vramUsed = gpuUsage.reduce((sum, gpu) => sum + (gpu.vram_used || 0), 0);

				const cpuUsage = metrics['system.cpu.usage'] || 0;
				const cpuCores = metrics['system.cpu.cores'] || 0;

				this.active = item.status === 'Active';
				this.rented = item.is_rented === true;
				this.name = item.name || '—';
				this.ip = item.ip || '';
				this.osLabel = (metrics['system.os.name'] || '—') + ' ' + (metrics['system.os.version'] || '');
				this.cpuModel = metrics['system.cpu.model'] || '—';
				this.cpuCores = cpuCores;
				this.ramLabel = this.formatBytes(ramTotal);
				this.diskLabel = this.formatBytes(diskTotal);
				this.diskCount = disks.length;
				this.gpuCount = gpus.length;
				this.cpuPercent = Math.round(cpuUsage);
				this.cpuSubtext = cpuCores ? (cpuUsage * cpuCores / 100).toFixed(1) + ' / ' + cpuCores + ' cores' : '';
				this.ramPercent = ramTotal ? Math.round((ramUsed / ramTotal) * 100) : 0;
				this.ramSubtext = ramTotal ? this.formatBytes(ramUsed) + ' / ' + this.formatBytes(ramTotal) : '';
				this.diskPercent = diskDenom ? Math.round((diskUsed / diskDenom) * 100) : 0;
				this.diskSubtext = diskDenom ? this.formatBytes(diskUsed) + ' / ' + this.formatBytes(diskDenom) : '';
				this.hasGpu = gpus.length > 0;
				this.vramPercent = vramTotal ? Math.round((vramUsed / vramTotal) * 100) : 0;
				this.vramSubtext = vramTotal ? this.formatBytes(vramUsed * 1024 * 1024) + ' / ' + this.formatBytes(vramTotal * 1024 * 1024) : '';
				this.uptime = this.formatUptime(metrics['system.uptime']);
				this.href = '/servers/' + (item.id || '');

				/* ===== Extra metrics from caller schema ===== */
				this.extraMetrics = (this.metrics || []).map((widget) =>
				{
					const value = metrics[widget.key];

					return {
						label: widget.label || widget.id,
						value: this.formatMetric(value, widget)
					};
				}).filter((entry) => entry.value !== null && entry.value !== '');
			});

			/* ===== RENDER ===== */

			return /* html */ `
				<div class="box">
					<div class="identity">
						<span :class="'dot ' + (active ? 'active' : 'inactive')"></span>
						<div class="identity-text">
							<h3 class="name">{{ name }}</h3>
							<div class="ip">{{ ip }}</div>
						</div>
					</div>

					<div class="specs">
						<span class="spec">
							<i>memory</i>
							{{ cpuModel }}
						</span>
						<span class="spec">
							<i>developer_board</i>
							{{ cpuCores }}c
						</span>
						<span class="spec">
							<i>database</i>
							{{ ramLabel }}
						</span>
						<span ot-if="diskCount" class="spec">
							<i>hard_drive_2</i>
							{{ diskLabel }}
						</span>
						<span ot-if="gpuCount" class="spec gpu">
							<i>developer_board</i>
							{{ gpuCount }} GPU
						</span>
						<span class="spec">
							<i>terminal</i>
							{{ osLabel }}
						</span>
						<span ot-for="metric in extraMetrics" class="spec extra">
							<span class="extra-label">{{ metric.label }}</span>
							<span class="extra-value">{{ metric.value }}</span>
						</span>
					</div>

					<div class="bars">
						<div class="mini">
							<span class="mini-label">CPU</span>
							<div class="mini-track">
								<div class="mini-fill brand" :style="'width:' + cpuPercent + '%'"></div>
							</div>
							<span class="mini-value">{{ cpuPercent }}%</span>
						</div>
						<div class="mini">
							<span class="mini-label">RAM</span>
							<div class="mini-track">
								<div class="mini-fill blue" :style="'width:' + ramPercent + '%'"></div>
							</div>
							<span class="mini-value">{{ ramPercent }}%</span>
						</div>
						<div class="mini">
							<span class="mini-label">DISK</span>
							<div class="mini-track">
								<div class="mini-fill green" :style="'width:' + diskPercent + '%'"></div>
							</div>
							<span class="mini-value">{{ diskPercent }}%</span>
						</div>
						<div ot-if="hasGpu" class="mini">
							<span class="mini-label">VRAM</span>
							<div class="mini-track">
								<div class="mini-fill orange" :style="'width:' + vramPercent + '%'"></div>
							</div>
							<span class="mini-value">{{ vramPercent }}%</span>
						</div>
					</div>

					<div class="aside">
						<span ot-if="tag" :class="'tag tag-' + (tag.color || 'brand')">{{ tag.label }}</span>
						<slot name="actions"></slot>
					</div>
				</div>
			`;
		}
	});
});
