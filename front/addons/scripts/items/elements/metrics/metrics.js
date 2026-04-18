onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'script-metrics',
		config:
		{
			config:
			{
				type: 'array',
				value: [],
				description: 'Metrics schema from a script (metric widget definitions).'
			},
			values:
			{
				type: 'object',
				value: null,
				description: 'Optional live values keyed by metric id. When null, only schema is shown.'
			}
		},
		render: function()
		{
			this.Compute(() =>
			{
				this.hasValues = this.values !== null && this.values !== undefined;

				this.items = (this.config || []).map((widget) =>
				{
					const value = this.hasValues ? this.values[widget.key] : undefined;

					return {
						id: widget.id,
						label: widget.label || widget.id,
						key: widget.key,
						widget: widget.widget || 'text',
						unit: widget.unit || '',
						present: value !== undefined && value !== null,
						value: value
					};
				});
			});

			this.formatValue = (entry) =>
			{
				if(!entry.present)
				{
					return '—';
				}

				const value = entry.value;

				if(entry.widget === 'badge')
				{
					if(value === true) return 'Yes';
					if(value === false) return 'No';
					return String(value);
				}

				if(Array.isArray(value))
				{
					return value.length + ' items';
				}

				return String(value);
			};

			return /* html */ `
				<div class="box">
					<div ot-for="entry in items" class="row">
						<div class="info">
							<div class="top">
								<span class="label">{{ entry.label }}</span>
								<span :class="'widget widget-' + entry.widget">{{ entry.widget }}</span>
							</div>
							<div class="key">{{ entry.key }}</div>
						</div>

						<div ot-if="hasValues" class="value">
							<span class="value-text">{{ formatValue(entry) }}</span>
							<span ot-if="entry.unit" class="unit">{{ entry.unit }}</span>
						</div>
					</div>
				</div>
			`;
		}
	});
});
