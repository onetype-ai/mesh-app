onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'log',
		config:
		{
			item:
			{
				type: 'object',
				value: null,
				description: 'Log row from logs addon.'
			},
			server:
			{
				type: 'object',
				value: null,
				description: 'Optional server item to resolve server_id → name.'
			},
			script:
			{
				type: 'object',
				value: null,
				description: 'Optional script item to resolve script_id → name.'
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

				if(seconds < 60) return seconds + 's ago';
				if(seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
				if(seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';

				return Math.floor(seconds / 86400) + 'd ago';
			};

			this.formatPreview = (output, level) =>
			{
				if(!output || typeof output !== 'object') return '';

				const primary = (level === 'Warn' || level === 'Error') ? output.stderr : output.stdout;
				const text = primary || JSON.stringify(output);
				const single = String(text).replace(/\s+/g, ' ').trim();

				if(single.length > 120) return single.slice(0, 120) + '…';

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

			/* ===== HANDLERS ===== */

			this.toggle = () =>
			{
				this.open = !this.open;
			};

			/* ===== DERIVED ===== */

			this.Compute(() =>
			{
				const item = this.item || {};

				const level = (item.level || 'Info').toLowerCase();
				const source = item.source || 'System';

				const sourceMap = {
					Agent: { icon: 'dns' },
					Script: { icon: 'terminal' },
					System: { icon: 'settings' }
				};

				this.level = item.level || 'Info';
				this.levelClass = level;
				this.source = source;
				this.sourceIcon = (sourceMap[source] || sourceMap.System).icon;

				this.serverName = this.server ? (this.server.name || this.server.id) : null;
				this.scriptName = this.script ? (this.script.name || this.script.id) : null;

				this.code = item.code;
				this.time = this.formatTime(item.time);
				this.ago = this.formatAgo(item.created_at);
				this.preview = this.formatPreview(item.output, item.level);

				this.output = item.output || {};
				this.outputPretty = this.formatJson(this.output);

				this.hasServer = !!this.serverName;
				this.hasScript = !!this.scriptName;
				this.hasCode = item.code !== null && item.code !== undefined;
				this.hasTime = !!item.time;
				this.hasPreview = !!this.preview;
			});

			/* ===== RENDER ===== */

			return /* html */ `
				<div :class="'box ' + (open ? 'open' : '')">
					<button class="head" ot-click="toggle">
						<span :class="'level ' + levelClass">{{ level }}</span>

						<span class="source">
							<i>{{ sourceIcon }}</i>
							<span>{{ source }}</span>
						</span>

						<div class="refs">
							<span ot-if="hasServer" class="ref">
								<i>dns</i>
								<span>{{ serverName }}</span>
							</span>
							<span ot-if="hasScript" class="ref">
								<i>terminal</i>
								<span>{{ scriptName }}</span>
							</span>
						</div>

						<div class="preview">{{ preview }}</div>

						<div class="meta">
							<span ot-if="hasCode" class="meta-code">{{ code }}</span>
							<span ot-if="hasTime" class="meta-time">{{ time }}</span>
							<span class="meta-ago">{{ ago }}</span>
							<i :class="'chevron ' + (open ? 'up' : 'down')">{{ open ? 'expand_less' : 'expand_more' }}</i>
						</div>
					</button>

					<div ot-if="open" class="body">
						<pre class="json">{{ outputPretty }}</pre>
					</div>
				</div>
			`;
		}
	});
});
