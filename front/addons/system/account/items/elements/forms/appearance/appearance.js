onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'account-form-appearance',
		icon: 'palette',
		name: 'Appearance Form',
		description: 'Appearance and display preferences form.',
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
				<e-form-section title="Appearance" description="Customize how OneType Travel looks and feels." background="bg-1" :variant="['border']">
					<div slot="content">
						<div ot-if="saved" class="ot-p-m">
							<e-global-notice icon="check_circle" text="Preferences saved." :variant="['green']"></e-global-notice>
						</div>

						<e-form-field label="Theme" description="Choose between light and dark mode." :variant="['border']">
							<e-form-select slot="input" name="theme" :value="'light'" :options="[
								{ label: 'Light', value: 'light' },
								{ label: 'Dark', value: 'dark' },
								{ label: 'System', value: 'system' }
							]" background="bg-2" size="m"></e-form-select>
						</e-form-field>

						<e-form-field label="Compact mode" description="Reduce spacing and show more content on screen." :variant="['border']">
							<e-form-toggle slot="input" name="compact"></e-form-toggle>
						</e-form-field>

						<e-form-field label="Show map by default" description="Automatically show the map when browsing destinations." :variant="['border']">
							<e-form-toggle slot="input" name="map" :value="true"></e-form-toggle>
						</e-form-field>

						<e-form-field label="Animations" description="Enable smooth transitions and hover effects.">
							<e-form-toggle slot="input" name="animations" :value="true"></e-form-toggle>
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
