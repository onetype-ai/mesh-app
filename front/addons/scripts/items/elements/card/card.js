onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'script-card',
		icon: 'terminal',
		name: 'Script Card',
		description: 'Clean, focused script preview card.',
		category: 'Scripts',
		config:
		{
			item:
			{
				type: 'object',
				value: null,
				description: 'Script row from scripts addon.'
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
			/* ===== DERIVED ===== */

			this.Compute(() =>
			{
				const item = this.item;

				/* Accent — derived from strongest relation. */

				if(item.package_id)
				{
					this.accent = 'orange';
				}
				else if(item.service_id)
				{
					this.accent = 'brand';
				}
				else if(item.server_id)
				{
					this.accent = 'green';
				}
				else
				{
					this.accent = 'brand';
				}

				/* Identity */

				this.identity =
				{
					name: item.name ? item.name : '—',
					description: item.description ? item.description : ''
				};

				/* Flags */

				this.flags =
				{
					verified: item.is_verified === true,
					draft: item.status === 'Draft',
					archived: item.deleted_at ? true : false,
					autorun: item.autorun === true
				};

				/* Schedule — only set when there is a real loop interval. */

				this.schedule = '';

				if(item.loop)
				{
					if(item.loop >= 1000)
					{
						this.schedule = (item.loop / 1000) + 's loop';
					}
					else
					{
						this.schedule = item.loop + 'ms loop';
					}
				}

				/* Output mode — shown only when script emits structured data. */

				this.output = '';

				if(item.output === 'JSON')
				{
					this.output = 'JSON';
				}

				/* Platforms — joined string for compact footer. */

				const platforms = item.platforms ? item.platforms : [];

				if(platforms.includes('*'))
				{
					this.platforms = 'All platforms';
				}
				else
				{
					this.platforms = platforms.filter((platform) => platform !== '*').join(' · ');
				}

				/* Slots */

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

				if(this.flags.archived)
				{
					list.push('archived');
				}

				if(this.flags.draft)
				{
					list.push('draft');
				}

				return list.join(' ');
			};

			/* ===== RENDER ===== */

			return /* html */ `
				<article :class="classes()">
					<header class="head">
						<div :class="'icon ' + accent">
							<i>terminal</i>
						</div>

						<div class="identity">
							<div class="title-row">
								<h3 class="name">{{ identity.name }}</h3>

								<span ot-if="flags.verified" class="verified" ot-tooltip="{ text: 'Verified by Mesh', position: { x: 'center', y: 'top' } }">
									<i>verified</i>
								</span>

								<span ot-if="flags.draft" class="draft-pill">Draft</span>
							</div>

							<div class="sub">
								<span ot-if="flags.autorun" class="sub-item sub-autorun">
									<i>bolt</i>
									<span>Autorun</span>
								</span>

								<span ot-if="flags.autorun && schedule" class="dot-sep"></span>

								<span ot-if="schedule" class="sub-item sub-schedule">
									<i>refresh</i>
									<span>{{ schedule }}</span>
								</span>

								<span ot-if="(flags.autorun || schedule) && output" class="dot-sep"></span>

								<span ot-if="output" class="sub-item sub-output">
									<i>data_object</i>
									<span>{{ output }}</span>
								</span>
							</div>
						</div>
					</header>

					<p ot-if="identity.description" class="description">{{ identity.description }}</p>

					<div ot-if="slots.tags" class="tags">
						<slot name="tags"></slot>
					</div>

					<footer class="foot">
						<span class="platforms">
							<i>memory</i>
							<span>{{ platforms }}</span>
						</span>

						<div ot-if="slots.actions" class="actions">
							<slot name="actions"></slot>
						</div>
					</footer>
				</article>
			`;
		}
	});
});
