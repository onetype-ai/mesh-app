onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'terminal',
		icon: 'terminal',
		name: 'Terminal',
		description: 'Live SSH-like output from an agent or every agent in the team.',
		category: 'Terminal',
		config:
		{
			server:
			{
				type: 'string',
				value: '',
				description: 'Optional server id. Empty shows merged output from every server in the team.'
			}
		},
		render: function()
		{
			/* ===== STATE ===== */

			this.lines   = [];
			this.cursor  = 0;
			this.alive   = true;
			this.pinned  = true;
			this.input   = '';
			this.running = false;

			/* ===== FORMATTERS ===== */

			this.formatTime = (iso) =>
			{
				if(!iso)
				{
					return '';
				}

				try
				{
					const date = new Date(iso);
					const h    = String(date.getHours()).padStart(2, '0');
					const m    = String(date.getMinutes()).padStart(2, '0');
					const s    = String(date.getSeconds()).padStart(2, '0');

					return h + ':' + m + ':' + s;
				}
				catch(error)
				{
					return '';
				}
			};

			/* ===== FETCH ===== */

			this.fetch = async () =>
			{
				const payload = {
					last:  this.cursor,
					limit: 200
				};

				if(this.server)
				{
					payload.server = this.server;
				}

				const { data, code } = await $ot.command('terminal:lines', payload, true);

				if(code !== 200 || !data)
				{
					return;
				}

				const incoming = data.items || [];

				if(incoming.length === 0)
				{
					return;
				}

				this.lines  = [...this.lines, ...incoming].slice(-1000);
				this.cursor = data.cursor;

				if(this.pinned)
				{
					this.scrollBottom();
				}
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
						console.warn('[e-terminal] fetch failed:', error.message);
					}

					await new Promise((resolve) => setTimeout(resolve, 1500));
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

			/* ===== SCROLL ===== */

			this.scrollBottom = () =>
			{
				requestAnimationFrame(() =>
				{
					requestAnimationFrame(() =>
					{
						const node = document.getElementById('e-terminal-screen');

						if(node)
						{
							node.scrollTop = node.scrollHeight;
						}
					});
				});
			};

			this.handleScroll = ({ event }) =>
			{
				const node     = event.target;
				const distance = node.scrollHeight - node.scrollTop - node.clientHeight;

				this.pinned = distance < 40;
			};

			this.pinBottom = () =>
			{
				this.pinned = true;
				this.scrollBottom();
			};

			/* ===== CLEAR ===== */

			this.clear = async () =>
			{
				const payload = {};

				if(this.server)
				{
					payload.server = this.server;
				}

				await $ot.command('terminal:clear', payload, true);

				this.lines  = [];
				this.cursor = 0;
			};

			/* ===== PROMPT ===== */

			this.handleInput = ({ value }) =>
			{
				this.input = value;
			};

			this.handleKey = ({ event }) =>
			{
				if(event.key !== 'Enter' || event.shiftKey)
				{
					return;
				}

				event.preventDefault();
				this.submit();
			};

			this.focusPrompt = () =>
			{
				setTimeout(() =>
				{
					const node = document.querySelector('.e-1d27a92 > .box > .prompt textarea');

					if(node)
					{
						node.focus();
					}
				}, 50);
			};

			this.submit = async () =>
			{
				const bash = (this.input || '').trim();

				if(!bash || this.running)
				{
					return;
				}

				if(bash === 'clear')
				{
					this.input = '';
					await this.clear();
					this.focusPrompt();
					return;
				}

				this.running = true;
				this.pinned  = true;

				try
				{
					const payload = {
						bash,
						terminal: true
					};

					if(this.server)
					{
						payload.server = this.server;
					}

					await $ot.command('agents:bash', payload, true);

					this.input = '';
					await this.fetch();
				}
				catch(error)
				{
					console.warn('[e-terminal] bash failed:', error.message);
				}
				finally
				{
					this.running = false;
					this.focusPrompt();
				}
			};

			/* ===== RENDER ===== */

			return /* html */ `
				<div class="box">
					<div class="notice">
						<i>bolt</i>
						<span class="notice-text">
							<strong>Fleet ops, not an interactive shell.</strong>
							One-shot commands, streamed live. No persistent session, no <code>cd</code> across runs. Interactive tools like <code>htop</code>, <code>vim</code> or password prompts will hang — chain steps with <code>&amp;&amp;</code>.
						</span>
					</div>

					<div class="bar">
						<span class="count">{{ lines.length }} lines</span>

						<e-form-button
							ot-if="!pinned"
							text="Follow"
							icon="keyboard_arrow_down"
							tone="soft"
							color="brand"
							size="s"
							:_click="pinBottom"
						></e-form-button>

						<e-form-button
							text="Clear"
							icon="delete_sweep"
							tone="ghost"
							size="s"
							:_click="clear"
						></e-form-button>
					</div>

					<div id="e-terminal-screen" class="screen" ot-scroll="handleScroll">
						<e-status-empty
							ot-if="lines.length === 0"
							icon="pending"
							title="Waiting for output"
							description="Agent hasn't streamed any lines yet."
						></e-status-empty>

						<div ot-if="lines.length > 0" class="stream">
							<div ot-for="line in lines" class="line">
								<span class="time">{{ formatTime(line.time) }}</span>
								<span class="server">{{ line.server_name || ('#' + line.server) }}</span>
								<span class="output">{{ line.output }}</span>
							</div>
						</div>
					</div>

					<div class="prompt" ot-keydown="handleKey">
						<e-form-textarea
							:value="input"
							:placeholder="server ? 'Type a command…' : 'Type a command — runs on every active server…'"
							:disabled="running"
							background="transparent"
							:variant="[]"
							rows="1"
							:minRows="1"
							:maxRows="6"
							:autoResize="true"
							:_input="handleInput"
						></e-form-textarea>
						<span ot-if="running" class="prompt-spin"><i>progress_activity</i></span>
					</div>
				</div>
			`;
		}
	});
});
