onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'notification-card',
		icon: 'notifications',
		name: 'Notification Card',
		description: 'Universal notification card with icon, title, description, time, action and unread state.',
		category: 'Notifications',
		author: 'OneType',
		config: {
			item: {
				type: 'object',
				value: null
			}
		},
		render: function()
		{
			this.colorClass = () =>
			{
				if(!this.item) return 'brand';

				const map = {
					booking: 'brand',
					approval: 'green',
					review: 'orange',
					message: 'blue',
					badge: 'orange',
					payout: 'green',
					alert: 'red',
					system: 'brand'
				};

				return map[this.item.type] || 'brand';
			};

			this.cls = this.colorClass();

			return `
				<div :class="'holder ' + cls + (item && item.unread ? ' unread' : '')">
					<div class="indicator"></div>
					<div class="icon"><i>{{ item ? item.icon : 'notifications' }}</i></div>
					<div class="body">
						<div class="title">{{ item ? item.title : '' }}</div>
						<div ot-if="item && item.description" class="description">{{ item.description }}</div>
						<div ot-if="item && item.time" class="time"><i>schedule</i> {{ item.time }}</div>
					</div>
					<e-form-button
						ot-if="item && item.action"
						:text="item.action"
						:href="item.href"
						background="bg-1" size="s"
					></e-form-button>
				</div>
			`;
		}
	});
});
