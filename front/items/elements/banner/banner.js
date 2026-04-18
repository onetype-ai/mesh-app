onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'banner',
		config: {
			image: {
				type: 'string',
				value: ''
			},
			icon: {
				type: 'string',
				value: ''
			},
			eyebrow: {
				type: 'string',
				value: ''
			},
			title: {
				type: 'string',
				value: ''
			},
			description: {
				type: 'string',
				value: ''
			},
			variant: {
				type: 'array',
				value: ['image', 'size-m'],
				options: ['image', 'dark', 'size-s', 'size-m', 'size-l']
			}
		},
		render: function()
		{
			this.hasBottom = !!this.Slots.bottom;

			return `
				<div :class="'holder ' + variant.join(' ')" :style="image ? 'background-image: url(' + image + ')' : ''">
					<div class="overlay"></div>
					<div class="content">
						<div ot-if="icon" class="icon"><i>{{ icon }}</i></div>
						<div ot-if="eyebrow" class="eyebrow">
							<span class="dot"><i>bolt</i></span>
							<span>{{ eyebrow }}</span>
						</div>
						<h1 ot-if="title" class="title"><span ot-html="title"></span></h1>
						<p ot-if="description" class="description">{{ description }}</p>
						<div ot-if="hasBottom" class="bottom">
							<slot name="bottom"></slot>
						</div>
					</div>
				</div>
			`;
		}
	});
});
