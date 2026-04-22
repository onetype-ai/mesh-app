onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'dashboard-grid',
		config:
		{
			server:
			{
				type: 'object',
				value: null,
				description: 'Optional server object for the header (id, name, ip, platform, status).'
			},
			groups:
			{
				type: 'array',
				value: [],
				description: 'Array of groups: [{ id, name, icon, source, color, status, schema, snapshots }].'
			},
			snapshots:
			{
				type: 'array',
				value: [],
				description: 'Fallback snapshots applied to groups that do not ship their own.'
			}
		},
		render: function()
		{
			this.Compute(() =>
			{
				const server = this.server || {};
				const groups = this.groups || [];

				this.hasServer = !!server && !!server.name;
				this.serverName = server.name || '';
				this.serverIp = server.ip || '';
				this.serverPlatform = server.platform || '';
				this.serverStatus = server.status || '';
				this.serverStatusColor = server.status === 'Active' ? 'green' : 'orange';

				this.prepared = groups.map((group) =>
				{
					return {
						id: group.id,
						name: group.name || '—',
						icon: group.icon || 'category',
						source: group.source || 'global',
						color: group.color || 'brand',
						status: group.status || '',
						statusColor: group.statusColor || 'green',
						description: group.description || '',
						schema: group.schema || {},
						snapshots: Array.isArray(group.snapshots) && group.snapshots.length ? group.snapshots : (this.snapshots || [])
					};
				});
			});

			return /* html */ `
				<div class="box">
					<header ot-if="hasServer" class="server-head">
						<div class="head-main">
							<h1 class="server-name">{{ serverName }}</h1>
							<div class="head-meta">
								<span ot-if="serverStatus" :class="'status status-' + serverStatusColor">
									<span class="pulse"></span>
									{{ serverStatus }}
								</span>
								<span ot-if="serverIp" class="chip"><i>lan</i>{{ serverIp }}</span>
								<span ot-if="serverPlatform" class="chip"><i>devices</i>{{ serverPlatform }}</span>
							</div>
						</div>
					</header>

					<div class="groups">
						<e-dashboard-group
							ot-for="group in prepared"
							:name="group.name"
							:description="group.description"
							:icon="group.icon"
							:source="group.source"
							:color="group.color"
							:status="group.status"
							:statusColor="group.statusColor"
							:schema="group.schema"
							:snapshots="group.snapshots"
						></e-dashboard-group>
					</div>
				</div>
			`;
		}
	});
});
