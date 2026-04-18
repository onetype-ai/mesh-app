onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'account-form-notifications',
		icon: 'notifications',
		name: 'Notifications Form',
		description: 'Notification preferences form with toggles per channel and category.',
		category: 'Account',
		author: 'OneType',
		render: function()
		{
			this.saved = false;

			this.onSuccess = async () =>
			{
				this.saved = true;
				setTimeout(() => { this.saved = false; }, 3000);
			};

			return `
				<div class="ot-flex ot-flex-col ot-gap-l">
					<e-form-section title="Email notifications" description="Choose which emails you'd like to receive." background="bg-1" :variant="['border']">
						<div slot="content">
							<div ot-if="saved" class="ot-p-m">
								<e-global-notice icon="check_circle" text="Preferences saved." :variant="['green']"></e-global-notice>
							</div>

							<e-form-field label="Booking confirmations" description="Receive confirmation when a booking is made or updated." :variant="['border']">
								<e-form-toggle slot="input" name="booking" :value="true"></e-form-toggle>
							</e-form-field>

							<e-form-field label="Messages" description="Get notified when someone sends you a message." :variant="['border']">
								<e-form-toggle slot="input" name="messages" :value="true"></e-form-toggle>
							</e-form-field>

							<e-form-field label="Reviews" description="Receive an email when someone leaves a review on your listing." :variant="['border']">
								<e-form-toggle slot="input" name="reviews" :value="true"></e-form-toggle>
							</e-form-field>

							<e-form-field label="Contributions" description="Get notified when your submissions are approved or need changes.">
								<e-form-toggle slot="input" name="contributions" :value="true"></e-form-toggle>
							</e-form-field>

							<div class="ot-p-m ot-flex ot-justify-end">
								<e-form-button text="Save" icon="save" color="brand" size="m" type="submit"></e-form-button>
							</div>
						</div>
					</e-form-section>

					<e-form-section title="Push notifications" description="Control what appears in your notification center." background="bg-1" :variant="['border']">
						<div slot="content">
							<e-form-field label="New bookings" description="When someone books one of your listings." :variant="['border']">
								<e-form-toggle slot="input" name="push_bookings" :value="true"></e-form-toggle>
							</e-form-field>

							<e-form-field label="Listing performance" description="Weekly summary of views, saves, and rankings." :variant="['border']">
								<e-form-toggle slot="input" name="push_performance"></e-form-toggle>
							</e-form-field>

							<e-form-field label="Travel tips" description="Personalized destination ideas and seasonal highlights.">
								<e-form-toggle slot="input" name="push_tips"></e-form-toggle>
							</e-form-field>

							<div class="ot-p-m ot-flex ot-justify-end">
								<e-form-button text="Save" icon="save" color="brand" size="m" type="submit"></e-form-button>
							</div>
						</div>
					</e-form-section>
				</div>
			`;
		}
	});
});
