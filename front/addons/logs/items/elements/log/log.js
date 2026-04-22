onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'log',
		icon: 'article',
		name: 'Log',
		description: 'Premium log entry with target/reference chips, user context, correlation grouping and expandable output.',
		category: 'Logs',
		config:
		{
			item:
			{
				type: 'object',
				value: null,
				description: 'Log row with optional target_<type> and reference_<type> joined entities.'
			}
		},
		render: function()
		{
			/* ===== STATE ===== */

			this.open = false;

			/* ===== FORMATTERS ===== */

			this.formatTime = (ms) =>
			{
				if(ms === null || ms === undefined) return '';
				if(ms < 1000) return ms + 'ms';
				return (ms / 1000).toFixed(1) + 's';
			};

			this.formatAgo = (date) =>
			{
				if(!date) return '';

				const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

				if(seconds < 5)      return 'just now';
				if(seconds < 60)     return seconds + 's ago';
				if(seconds < 3600)   return Math.floor(seconds / 60) + 'm ago';
				if(seconds < 86400)  return Math.floor(seconds / 3600) + 'h ago';

				return Math.floor(seconds / 86400) + 'd ago';
			};

			this.formatFull = (date) =>
			{
				if(!date) return '';

				try
				{
					return new Date(date).toISOString().replace('T', ' ').replace('Z', '');
				}
				catch(error)
				{
					return String(date);
				}
			};

			this.formatPreview = (output, level) =>
			{
				if(!output || typeof output !== 'object') return '';

				const priority = level === 'Warn' || level === 'Error' ? 'stderr' : 'stdout';
				const primary = output[priority];
				const fallback = output.message || output.stdout || output.stderr;
				const text = primary || fallback;

				if(!text) return '';

				const single = String(text).replace(/\s+/g, ' ').trim();

				if(single.length > 160) return single.slice(0, 160) + '…';

				return single;
			};

			this.formatJson = (value) =>
			{
				try
				{
					return JSON.stringify(value, null, 2);
				}
				catch(error)
				{
					return String(value);
				}
			};

			this.iconFor = (type) =>
			{
				if(type === 'Server')  return 'dns';
				if(type === 'Script')  return 'terminal';
				if(type === 'Package') return 'inventory_2';
				if(type === 'Service') return 'deployed_code';

				return 'circle';
			};

			this.hrefFor = (type, id) =>
			{
				if(!type || !id) return null;
				if(type === 'Server')  return '/servers/' + id;
				if(type === 'Script')  return '/creator/scripts/' + id;
				if(type === 'Package') return '/creator/packages/' + id;
				if(type === 'Service') return '/creator/services/' + id;

				return null;
			};

			/* ===== HANDLERS ===== */

			this.toggle = () =>
			{
				this.open = !this.open;
			};

			/* ===== DERIVED ===== */

			this.Compute(() =>
			{
				const item = this.item ? this.item : {};

				this.level         = item.level ? item.level : 'Info';
				this.levelClass    = this.level.toLowerCase();
				this.action        = item.action ? item.action : '';
				this.correlationId = item.correlation_id ? item.correlation_id : '';

				this.target = null;

				if(item.target_type && item.target_id)
				{
					const entity = item['target_' + item.target_type.toLowerCase()];

					this.target =
					{
						type: item.target_type,
						id: item.target_id,
						name: entity && entity.name ? entity.name : ('#' + item.target_id),
						icon: this.iconFor(item.target_type),
						href: this.hrefFor(item.target_type, item.target_id)
					};
				}

				this.reference = null;

				if(item.reference_type && item.reference_id)
				{
					const entity = item['reference_' + item.reference_type.toLowerCase()];

					this.reference =
					{
						type: item.reference_type,
						id: item.reference_id,
						name: entity && entity.name ? entity.name : ('#' + item.reference_id),
						icon: this.iconFor(item.reference_type),
						href: this.hrefFor(item.reference_type, item.reference_id)
					};
				}

				this.user =
				{
					has:   !!(item.user && item.user.id),
					id:    item.user && item.user.id    ? item.user.id    : null,
					name:  item.user && item.user.name  ? item.user.name  : '',
					email: item.user && item.user.email ? item.user.email : ''
				};

				this.actor =
				{
					ip:    item.actor_ip    ? item.actor_ip    : '',
					agent: item.actor_agent ? item.actor_agent : ''
				};

				this.code       = item.code;
				this.hasCode    = item.code !== null && item.code !== undefined;
				this.time       = this.formatTime(item.time);
				this.hasTime    = !!item.time;
				this.ago        = this.formatAgo(item.created_at);
				this.full       = this.formatFull(item.created_at);

				this.hits       = item.hit_count ? item.hit_count : 1;
				this.hasHits    = this.hits > 1;

				this.output       = item.output ? item.output : {};
				this.preview      = this.formatPreview(this.output, this.level);
				this.hasPreview   = !!this.preview;
				this.outputPretty = this.formatJson(this.output);
				this.hasOutput    = this.output && Object.keys(this.output).length > 0;
			});

			/* ===== CLASSES ===== */

			this.classes = () =>
			{
				const list = ['box', 'level-' + this.levelClass];

				if(this.open)
				{
					list.push('open');
				}

				return list.join(' ');
			};

			/* ===== RENDER ===== */

			return /* html */ `
				<article :class="classes()">
					<button type="button" class="head" ot-click="toggle">
						<span :class="'level level-' + levelClass">{{ level }}</span>

						<span ot-if="action" class="action">{{ action }}</span>

						<div class="chips">
							<span ot-if="target" class="chip chip-target">
								<i>{{ target.icon }}</i>
								<span class="chip-label">{{ target.type }}</span>
								<span class="chip-name">{{ target.name }}</span>
							</span>

							<span ot-if="reference" class="chip-arrow">
								<i>arrow_right_alt</i>
							</span>

							<span ot-if="reference" class="chip chip-reference">
								<i>{{ reference.icon }}</i>
								<span class="chip-label">{{ reference.type }}</span>
								<span class="chip-name">{{ reference.name }}</span>
							</span>
						</div>

						<div class="meta">
							<span ot-if="hasHits" class="meta-hits" :ot-tooltip="{ text: hits + ' occurrences', position: { x: 'center', y: 'top' } }"><i>repeat</i>{{ hits }}</span>
							<span ot-if="hasTime" class="meta-time">{{ time }}</span>
							<span class="meta-ago" :ot-tooltip="{ text: full, position: { x: 'center', y: 'top' } }">{{ ago }}</span>
							<i class="chevron">{{ open ? 'expand_less' : 'expand_more' }}</i>
						</div>

						<div class="preview">
							<span ot-if="hasCode" :class="code === 0 ? 'exit ok' : 'exit bad'">exit {{ code }}</span>
							<span ot-if="hasPreview" class="preview-text">{{ preview }}</span>
						</div>
					</button>

					<div ot-if="open" class="body">
						<div class="meta-grid">
							<div ot-if="user.has" class="meta-row">
								<span class="meta-key">User</span>
								<span class="meta-value">{{ user.name }}</span>
							</div>

							<div ot-if="user.has && user.email" class="meta-row">
								<span class="meta-key">Email</span>
								<span class="meta-value mono">{{ user.email }}</span>
							</div>

							<div ot-if="!user.has" class="meta-row">
								<span class="meta-key">Actor</span>
								<span class="meta-value dim">System</span>
							</div>

							<div ot-if="actor.ip" class="meta-row">
								<span class="meta-key">IP</span>
								<span class="meta-value mono">{{ actor.ip }}</span>
							</div>

							<div ot-if="actor.agent" class="meta-row">
								<span class="meta-key">Agent</span>
								<span class="meta-value">{{ actor.agent }}</span>
							</div>

							<div class="meta-row">
								<span class="meta-key">When</span>
								<span class="meta-value mono">{{ full }}</span>
							</div>
						</div>

						<div ot-if="hasOutput" class="output">
							<e-global-code
								:source="outputPretty"
								language="json"
								:lines="true"
								filename="output.json"
								background="bg-1"
								size="s"
							></e-global-code>
						</div>
					</div>
				</article>
			`;
		}
	});
});
