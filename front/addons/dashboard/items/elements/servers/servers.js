onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'dashboard-servers',
		config:
		{
			fleet:
			{
				type: 'object',
				value: null,
				description: 'Fleet summary group { name, description, icon, schema, snapshots }.'
			},
			servers:
			{
				type: 'array',
				value: [],
				description: 'Columns of every matrix. [{ id, name, status }].'
			},
			packages:
			{
				type: 'object',
				value: null,
				description: '{ items, cells }. items=[{id,name,slug,icon,color}] cells=[{item_id, server_id, state, stats}].'
			},
			services:
			{
				type: 'object',
				value: null,
				description: 'Same shape as packages but for services.'
			}
		},
		render: function()
		{
			this.Compute(() =>
			{
				const fleet = this.fleet || null;

				this.fleetGroups = [];

				if(fleet && fleet.schema)
				{
					this.fleetGroups.push({
						id: 'fleet',
						name: fleet.name || 'Fleet overview',
						description: fleet.description || 'Aggregated metrics across every active server.',
						icon: fleet.icon || 'hub',
						color: fleet.color || 'brand',
						source: 'global',
						schema: fleet.schema,
						snapshots: fleet.snapshots || []
					});
				}

				this.hasFleet = this.fleetGroups.length > 0;

				const servers = this.servers || [];
				const packages = this.packages || { items: [], cells: [] };
				const services = this.services || { items: [], cells: [] };

				this.hasPackages = (packages.items || []).length > 0 && servers.length > 0;
				this.hasServices = (services.items || []).length > 0 && servers.length > 0;

				this.packageItems = packages.items || [];
				this.packageCells = packages.cells || [];

				this.serviceItems = services.items || [];
				this.serviceCells = services.cells || [];
			});

			return /* html */ `
				<div class="box">
					<e-dashboard-grid ot-if="hasFleet" :groups="fleetGroups"></e-dashboard-grid>

					<e-dashboard-matrix
						ot-if="hasPackages"
						label="Packages across fleet"
						description="Which servers have each package installed and running."
						icon="inventory_2"
						kind="packages"
						:items="packageItems"
						:servers="servers"
						:cells="packageCells"
					></e-dashboard-matrix>

					<e-dashboard-matrix
						ot-if="hasServices"
						label="Services across fleet"
						description="Where each service is deployed and running."
						icon="deployed_code"
						kind="services"
						:items="serviceItems"
						:servers="servers"
						:cells="serviceCells"
					></e-dashboard-matrix>
				</div>
			`;
		}
	});
});
