elements.ItemAdd({
	id: 'sidebar',
	config: {
		title: { type: 'string' },
		subtitle: { type: 'string' },
		version: { type: 'string' },
		groups: { type: 'array', value: [] }
	},
	render: function()
	{
		return /* html */ `
			<e-navigation-sidebar
				:title="title"
				:subtitle="subtitle"
				:version="version"
				:groups="groups"
				background="bg-1"
			></e-navigation-sidebar>
		`;
	}
});
