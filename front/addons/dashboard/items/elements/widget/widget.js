onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'dashboard-widget',
		config:
		{
			label:
			{
				type: 'string',
				value: '',
				description: 'Widget title shown at the top.'
			},
			description:
			{
				type: 'string',
				value: '',
				description: 'Help text shown as a tooltip on the title.'
			},
			icon:
			{
				type: 'string',
				value: '',
				description: 'Leading icon next to the title.'
			},
			color:
			{
				type: 'string',
				value: 'brand',
				options: ['brand', 'blue', 'green', 'orange', 'red', 'neutral'],
				description: 'Accent color for the widget.'
			},
			size:
			{
				type: 'string',
				value: 'm',
				options: ['s', 'm', 'l', 'xl'],
				description: 'Widget grid column span hint (s=1, m=1, l=2, xl=full).'
			},
			stale:
			{
				type: 'boolean',
				value: false,
				description: 'Mark value as stale when last snapshot is missing this key.'
			}
		},
		render: function()
		{
			this.Compute(() =>
			{
				const classes = ['box', 'accent-' + this.color, 'size-' + this.size];

				if(this.stale)
				{
					classes.push('stale');
				}

				this.classes = classes.join(' ');
				this.hasTitle = !!this.label || !!this.icon;
			});

			return /* html */ `
				<div :class="classes">
					<div ot-if="hasTitle" class="head">
						<div class="head-left">
							<i ot-if="icon" class="head-icon">{{ icon }}</i>
							<span class="head-label">{{ label }}</span>
						</div>
						<i ot-if="description" class="head-help" :ot-tooltip="{ text: description, position: { x: 'center', y: 'top' } }">info</i>
					</div>
					<div class="body">
						<slot name="body"></slot>
					</div>
					<div ot-if="stale" class="stale-badge">Stale</div>
				</div>
			`;
		}
	});
});
