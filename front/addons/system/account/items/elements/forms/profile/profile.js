onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'account-form-profile',
		icon: 'person',
		name: 'Profile Form',
		description: 'Account profile settings form with name, email, phone and toggles.',
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
				<e-form-section title="Account" description="Manage your personal information, contact details, and login credentials." background="bg-1" :variant="['border']">
					<div slot="content">
						<div ot-if="saved" class="ot-p-m">
							<e-global-notice icon="check_circle" text="Profile saved." :variant="['green']"></e-global-notice>
						</div>

						<e-form-field label="Full name" description="This is the name shown on your public profile and reviews." :variant="['border']">
							<e-form-input slot="input" name="name" placeholder="Your name" background="bg-2" size="m"></e-form-input>
						</e-form-field>

						<e-form-field label="Email address" description="We'll send booking confirmations and important account updates here." :variant="['border']">
							<e-form-input slot="input" name="email" placeholder="you@email.com" type="email" background="bg-2" size="m"></e-form-input>
						</e-form-field>

						<e-form-field label="Phone number" description="For two-factor authentication and host messaging." :variant="['border']">
							<e-form-input slot="input" name="phone" placeholder="+381 64 123 4567" type="tel" background="bg-2" size="m"></e-form-input>
						</e-form-field>

						<e-form-field label="Marketing emails" description="Trip ideas, new destinations, and contributor highlights." :variant="['border']">
							<e-form-toggle slot="input" name="marketing"></e-form-toggle>
						</e-form-field>

						<e-form-field label="Show profile publicly" description="Allow other travellers to view your contributions and stories.">
							<e-form-toggle slot="input" name="public"></e-form-toggle>
						</e-form-field>

						<div class="ot-p-m ot-flex ot-justify-end">
							<e-form-button text="Save" icon="save" color="brand" size="m" type="submit"></e-form-button>
						</div>
					</div>
				</e-form-section>
			`;
		}
	});
});
