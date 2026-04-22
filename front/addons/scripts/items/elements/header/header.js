onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'script-header',
		icon: 'terminal',
		name: 'Script Header',
		description: 'Premium hero for a script detail page.',
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

				this.identity =
				{
					name: item.name ? item.name : '—',
					description: item.description ? item.description : ''
				};

				this.flags =
				{
					verified: item.is_verified === true,
					marketplace: item.is_marketplace === true,
					published: item.status === 'Published',
					draft: item.status === 'Draft',
					autorun: item.autorun === true
				};

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

				this.output = '';

				if(item.output === 'JSON')
				{
					this.output = 'JSON';
				}

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
								<i>terminal</i>
							</div>

							<div class="head-text">
								<div class="title-row">
									<h1 class="name">{{ identity.name }}</h1>

									<span ot-if="flags.verified" class="verified" ot-tooltip="{ text: 'Verified by Mesh', position: { x: 'center', y: 'top' } }">
										<i>verified</i>
									</span>
								</div>

								<div class="sub">
									<span class="platforms">{{ platforms }}</span>

									<span ot-if="flags.autorun" class="dot-sep"></span>
									<span ot-if="flags.autorun" class="sub-autorun">
										<i>bolt</i>
										<span>Autorun</span>
									</span>

									<span ot-if="schedule" class="dot-sep"></span>
									<span ot-if="schedule" class="sub-schedule">
										<i>refresh</i>
										<span>{{ schedule }}</span>
									</span>

									<span ot-if="output" class="dot-sep"></span>
									<span ot-if="output" class="sub-output">
										<i>data_object</i>
										<span>{{ output }}</span>
									</span>

									<span ot-if="flags.marketplace" class="dot-sep"></span>
									<span ot-if="flags.marketplace" class="sub-marketplace">
										<i>storefront</i>
										<span>Marketplace</span>
									</span>

									<span ot-if="flags.draft" class="dot-sep"></span>
									<span ot-if="flags.draft" class="sub-draft">
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
