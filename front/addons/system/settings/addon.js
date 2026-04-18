const settings = onetype.Addon('settings', (addon) =>
{
	addon.Field('group', ['string']);
	addon.Field('order', ['number', 0]);
	addon.Field('items', {
		type: 'array',
		value: [],
		each: {
			type: 'object',
			config: {
				icon: { type: 'string' },
				label: { type: 'string' },
				href: { type: 'string' }
			}
		}
	});
});
