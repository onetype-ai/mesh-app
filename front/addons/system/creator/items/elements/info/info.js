onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'creator-info',
		config:
		{
			item:
			{
				type: 'object',
				value: null,
				description: 'Addon item (script, package, service) being edited.'
			},
			type:
			{
				type: 'string',
				value: 'script',
				options: ['script', 'package', 'service'],
				description: 'What kind of item — drives labels and actions.'
			}
		},
		render: function()
		{
			this.formatDate = (iso) =>
			{
				if(!iso) return '—';
				return new Date(iso).toLocaleString();
			};

			this.published = (this.item && this.item.status) === 'Published';
			this.status = {
				label: (this.item && this.item.status) || 'Draft',
				color: this.published ? 'green' : 'orange'
			};

			this.Compute(() =>
			{
				const item = this.item || {};

				const typeMap = {
					script:  { icon: 'terminal',      backHref: '/creator/scripts' },
					package: { icon: 'inventory_2',   backHref: '/creator/packages' },
					service: { icon: 'deployed_code', backHref: '/creator/services' }
				};

				const info = typeMap[this.type] || typeMap.script;

				this.icon = info.icon;

				if(this.type === 'script' && item.package && item.package.id)
				{
					this.backHref = '/creator/packages/' + item.package.id + '/scripts';
				}
				else if(this.type === 'script' && item.service && item.service.id)
				{
					this.backHref = '/creator/services/' + item.service.id + '/scripts';
				}
				else
				{
					this.backHref = info.backHref;
				}

				this.name = item.name || '—';
				this.description = item.description || '';
				this.version = item.version || '';
				this.isMarketplace = item.is_marketplace === true;

				const showApproved = this.isMarketplace && item.status === 'Published';

				this.rows =
				[
					item.version ? { label: 'Version', value: item.version, icon: 'tag' } : null,
					{ label: 'Marketplace', value: this.isMarketplace ? 'Yes' : 'Private', icon: 'storefront', color: this.isMarketplace ? 'brand' : null },
					{ label: 'Updated', value: this.formatDate(item.updated_at || item.created_at), icon: 'schedule' }
				].filter(Boolean);

				this.tags = showApproved
					? [{ label: item.is_verified ? 'Approved' : 'Pending review', icon: 'verified', color: item.is_verified ? 'green' : 'orange' }]
					: [];
			});

			this.handlePublish = async () =>
			{
				const action = this.published ? 'Unpublish' : 'Publish';
				const description = this.published
					? 'Unpublish this ' + this.type + '? It will move back to Draft.'
					: 'Publish this ' + this.type + '? It will become Published.';

				const confirmed = await $ot.confirm(action + ' ' + this.type, description, {
					confirm: action
				});

				if(!confirmed)
				{
					return;
				}

				const command = this.published ? this.type + 's:unpublish' : this.type + 's:publish';
				await $ot.command(command, { id: this.item.id });

				const nextPublished = !this.published;
				this.published = nextPublished;
				this.status = {
					label: nextPublished ? 'Published' : 'Draft',
					color: nextPublished ? 'green' : 'orange'
				};
			};

			this.handleDelete = async () =>
			{
				const confirmed = await $ot.confirm('Delete ' + this.type, 'This cannot be undone.', {
					type: 'danger',
					confirm: 'Delete'
				});

				if(!confirmed)
				{
					return;
				}

				await $ot.command(this.type + 's:delete', { id: this.item.id, redirect: 'creator' });
			};

			return /* html */ `
				<e-cards-info
					:icon="icon"
					:title="name"
					:description="description"
					:status="status"
					:rows="rows"
					:tags="tags"
					:variant="[]"
				>
					<div slot="actions">
						<div class="ot-flex ot-gap-s">
							<e-form-button
								icon="arrow_back"
								tooltip="Back"
								:href="backHref"
								background="bg-3"
								size="s"
								:variant="['icon-only']"
							></e-form-button>

							<e-form-button
								icon="delete"
								tooltip="Delete"
								color="red"
								tone="soft"
								size="s"
								:variant="['icon-only']"
								:_click="handleDelete"
							></e-form-button>

							<e-form-button
								:text="published ? 'Unpublish' : 'Publish'"
								:icon="published ? 'unpublished' : 'publish'"
								color="brand"
								tone="soft"
								size="s"
								:_click="handlePublish"
							></e-form-button>
						</div>
					</div>
				</e-cards-info>
			`;
		}
	});
});
