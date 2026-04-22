onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'package-card',
		icon: 'inventory_2',
		name: 'Package Card',
		description: 'Clean, focused package preview card.',
		category: 'Packages',
		config:
		{
			item:
			{
				type: 'object',
				value: null,
				description: 'Package row from packages addon.'
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

				/* Accent — server-bound packages get a green tint. Default is warm orange. */

				if(item.server_id)
				{
					this.accent = 'green';
				}
				else
				{
					this.accent = 'orange';
				}

				/* Identity */

				this.identity =
				{
					name: item.name ? item.name : '—',
					description: item.description ? item.description : '',
					version: item.version ? item.version : ''
				};

				/* Flags */

				this.flags =
				{
					verified: item.is_verified === true,
					draft: item.status === 'Draft',
					archived: item.deleted_at ? true : false
				};

				/* Platforms — joined string to keep the card compact. */

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
							<i>inventory_2</i>
						</div>

						<div class="identity">
							<div class="title-row">
								<h3 class="name">{{ identity.name }}</h3>

								<span ot-if="flags.verified" class="verified" ot-tooltip="{ text: 'Verified by Mesh', position: { x: 'center', y: 'top' } }">
									<i>verified</i>
								</span>

								<span ot-if="flags.draft" class="draft-pill">Draft</span>
							</div>

							<span ot-if="identity.version" class="version">{{ identity.version }}</span>
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
