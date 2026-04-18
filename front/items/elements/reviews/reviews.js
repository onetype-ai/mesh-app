onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'reviews',
		config: {
			rating: {
				type: 'number',
				value: 0
			},
			total: {
				type: 'number',
				value: 0
			},
			breakdown: {
				type: 'array',
				value: []
			},
			items: {
				type: 'array',
				value: []
			},
			variant: {
				type: 'array',
				value: [],
				options: ['compact', 'border']
			}
		},
		render: function()
		{
			this.starsHtml = (count) =>
			{
				let html = '';

				for(let i = 0; i < 5; i++)
				{
					html += '<i class="star' + (i < count ? ' filled' : '') + '">' + (i < count ? 'star' : 'star_border') + '</i>';
				}

				return html;
			};

			this.overallStars = this.starsHtml(Math.round(this.rating));
			this.hasBreakdown = this.breakdown && this.breakdown.length > 0;
			this.hasItems = this.items && this.items.length > 0;

			this.reviewsHtml = this.items.map(review =>
			{
				const stars = this.starsHtml(Math.round(review.rating || 0));
				const avatar = review.author && review.author.avatar
					? '<div class="avatar" style="background-image: url(' + review.author.avatar + ')"></div>'
					: '<div class="avatar"><i>person</i></div>';

				const author = review.author
					? '<div class="author">'
						+ avatar
						+ '<div class="info">'
							+ '<span class="name">' + (review.author.name || '') + '</span>'
							+ (review.author.location ? '<span class="location">' + review.author.location + '</span>' : '')
						+ '</div>'
					+ '</div>'
					: '';

				const reply = review.reply
					? '<div class="reply">'
						+ '<div class="reply-who">' + (review.reply.who || 'Host reply') + ' · ' + (review.reply.date || '') + '</div>'
						+ '<p class="reply-text">' + (review.reply.text || '') + '</p>'
					+ '</div>'
					: '';

				return '<div class="review">'
					+ '<div class="review-head">'
						+ author
						+ '<div class="review-meta">'
							+ '<div class="review-stars">' + stars + '</div>'
							+ (review.date ? '<span class="review-date">' + review.date + '</span>' : '')
						+ '</div>'
					+ '</div>'
					+ (review.text ? '<p class="review-text">' + review.text + '</p>' : '')
					+ reply
					+ '<div class="review-actions">'
						+ '<button class="review-action"><i>thumb_up</i> Helpful</button>'
						+ '<button class="review-action"><i>flag</i> Report</button>'
					+ '</div>'
				+ '</div>';
			}).join('');

			return `
				<div :class="'holder ' + variant.join(' ')">
					<div class="summary">
						<div class="overall">
							<div class="overall-num">{{ rating }}</div>
							<div class="overall-stars"><span ot-html="overallStars"></span></div>
							<div class="overall-label">{{ total }} reviews</div>
						</div>
						<div ot-if="hasBreakdown" class="breakdown">
							<div ot-for="b in breakdown" class="bar-row">
								<span class="bar-label">{{ b.label }}</span>
								<div class="bar"><div class="bar-fill" :style="'width: ' + (b.value / 5 * 100) + '%'"></div></div>
								<span class="bar-num">{{ b.value }}</span>
							</div>
						</div>
					</div>

					<div ot-if="hasItems" class="list">
						<span ot-html="reviewsHtml"></span>
					</div>
				</div>
			`;
		}
	});
});
