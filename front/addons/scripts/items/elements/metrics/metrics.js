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
			/* ===== HELPERS ===== */

			this.formatCell = (value, unit) =>
			{
				if(value === undefined || value === null || value === '') return '—';

				if(value === true) return 'Yes';
				if(value === false) return 'No';

				if(unit === 'bytes' && typeof value === 'number')
				{
					const units = ['B', 'KB', 'MB', 'GB', 'TB'];
					let index = 0;
					let size = value;

					while(size >= 1024 && index < units.length - 1)
					{
						size /= 1024;
						index++;
					}

					return (size < 10 ? size.toFixed(1) : Math.round(size)) + ' ' + units[index];
				}

				return String(value);
			};

			this.toSubConfig = (fields) =>
			{
				return fields.map((field) =>
				{
					return {
						id: field.key,
						key: field.key,
						label: field.label || field.key,
						unit: field.unit || '',
						widget: field.unit ? 'number' : 'text',
						value: 'scalar'
					};
				});
			};

			/* ===== DERIVED ===== */

			this.Compute(() =>
			{
				this.hasValues = this.values !== null && this.values !== undefined;

				this.items = (this.config || []).map((widget) =>
				{
					const value = this.hasValues ? this.values[widget.key] : undefined;
					const isList = widget.widget === 'list' && Array.isArray(value);

					return {
						id: widget.id,
						label: widget.label || widget.id,
						key: widget.key,
						widget: widget.widget || 'text',
						unit: widget.unit || '',
						present: value !== undefined && value !== null,
						value: value,
						isList,
						rows: isList ? value : [],
						subConfig: isList ? this.toSubConfig(widget.fields || []) : []
					};
				});
			});

			this.formatValue = (entry) =>
			{
				if(!entry.present) return '—';

				if(entry.widget === 'badge')
				{
					if(entry.value === true) return 'Yes';
					if(entry.value === false) return 'No';
					return String(entry.value);
				}

				return this.formatCell(entry.value, entry.unit);
			};

			/* ===== RENDER ===== */

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

						<div ot-if="hasValues && !entry.isList" class="value">
							<span class="value-text">{{ formatValue(entry) }}</span>
							<span ot-if="entry.unit && entry.unit !== 'bytes'" class="unit">{{ entry.unit }}</span>
						</div>

						<div ot-if="hasValues && entry.isList" class="nested">
							<e-script-metrics
								ot-for="row in entry.rows"
								:config="entry.subConfig"
								:values="row"
							></e-script-metrics>
						</div>
					</div>
				</div>
			`;
		}
	});
});
