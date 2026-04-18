onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'account-form-security',
		icon: 'lock',
		name: 'Security Form',
		description: 'Security settings form with password change and two-factor authentication.',
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
					<e-form-section title="Change password" description="Update your password to keep your account secure." background="bg-1" :variant="['border']">
						<div slot="content">
							<div ot-if="saved" class="ot-p-m">
								<e-global-notice icon="check_circle" text="Password updated." :variant="['green']"></e-global-notice>
							</div>

							<e-form-field label="Current password" description="Enter your existing password to verify your identity." :variant="['border']">
								<e-form-input slot="input" name="current" type="password" placeholder="••••••••" background="bg-2" size="m"></e-form-input>
							</e-form-field>

							<e-form-field label="New password" description="Must be at least 8 characters with one uppercase and one number." :variant="['border']">
								<e-form-input slot="input" name="password" type="password" placeholder="••••••••" background="bg-2" size="m"></e-form-input>
							</e-form-field>

							<e-form-field label="Confirm password" description="Re-enter your new password to confirm.">
								<e-form-input slot="input" name="confirm" type="password" placeholder="••••••••" background="bg-2" size="m"></e-form-input>
							</e-form-field>

							<div class="ot-p-m ot-flex ot-justify-end">
								<e-form-button text="Update password" icon="lock" color="brand" size="m" type="submit"></e-form-button>
							</div>
						</div>
					</e-form-section>

					<e-form-section title="Two-factor authentication" description="Add an extra layer of security to your account." background="bg-1" :variant="['border']">
						<div slot="content">
							<e-form-field label="Authenticator app" description="Use an app like Google Authenticator or Authy to generate codes." :variant="['border']">
								<e-form-toggle slot="input" name="totp"></e-form-toggle>
							</e-form-field>

							<e-form-field label="SMS backup" description="Receive codes via SMS if you lose access to your authenticator.">
								<e-form-toggle slot="input" name="sms"></e-form-toggle>
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
