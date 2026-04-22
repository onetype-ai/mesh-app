onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'package-header',
		icon: 'inventory_2',
		name: 'Package Header',
		description: 'Premium hero for a package detail page.',
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
				value: 'l',
				options: ['m', 'l'],
				description: 'Header scale.'
			}
		},
		render: function()
		{
			/* ===== DERIVED ===== */

			this.Compute(() =>
			{
				const item = this.item;

				if(item.server_id)
				{
					this.accent = 'green';
				}
				else
				{
					this.accent = 'orange';
				}

				this.identity =
				{
					name: item.name ? item.name : '—',
					description: item.description ? item.description : '',
					version: item.version ? item.version : ''
				};

				this.flags =
				{
					verified: item.is_verified === true,
					marketplace: item.is_marketplace === true,
					published: item.status === 'Published',
					draft: item.status === 'Draft'
				};

				const platforms = item.platforms ? item.platforms : [];

				if(platforms.includes('*'))
				{
					this.platforms = 'All platforms';
				}
				else
				{
					this.platforms = platforms.filter((platform) => platform !== '*').join(' · ');
				}

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
						<div class="head">
							<div :class="'icon ' + accent">
								<i>inventory_2</i>
							</div>

							<div class="head-text">
								<div class="title-row">
									<h1 class="name">{{ identity.name }}</h1>

									<span ot-if="flags.verified" class="verified" ot-tooltip="{ text: 'Verified by Mesh', position: { x: 'center', y: 'top' } }">
										<i>verified</i>
									</span>
								</div>

								<div class="sub">
									<span ot-if="identity.version" class="version">{{ identity.version }}</span>
									<span ot-if="identity.version" class="dot-sep"></span>
									<span class="platforms">{{ platforms }}</span>
									<span ot-if="flags.marketplace" class="dot-sep"></span>
									<span ot-if="flags.marketplace" class="marketplace">
										<i>storefront</i>
										<span>Marketplace</span>
									</span>
									<span ot-if="flags.draft" class="dot-sep"></span>
									<span ot-if="flags.draft" class="draft">
										<i>edit_note</i>
										<span>Draft</span>
									</span>
								</div>
							</div>

							<div ot-if="slots.right" class="right">
								<slot name="right"></slot>
							</div>
						</div>

						<p ot-if="identity.description" class="description">{{ identity.description }}</p>

						<div ot-if="slots.tags" class="tags">
							<slot name="tags"></slot>
						</div>
					</div>
				</section>
			`;
		}
	});
});
