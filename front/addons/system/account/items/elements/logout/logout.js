onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'account-logout',
		icon: 'logout',
		name: 'Auth Logout',
		description: 'Logout page with split layout and farewell message.',
		category: 'Account',
		author: 'OneType',
		render: function()
		{
			this.loading = true;
			this.done = false;

			this.OnReady(async () =>
			{
				await fetch('/api/auth/logout', { method: 'POST' });
				onetype.StateSet('user', null);

				this.loading = false;
				this.done = true;
			});

			return /* html */ `
				<div class="split">
					<div class="showcase">
						<e-banner
							image="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1800&q=80"
							eyebrow="OneType Travel"
							title="Until your <em>next journey</em>."
							description="Your saved places, stories, and trips will be right here when you come back."
						>
							<div slot="bottom">
								<e-form-button text="Back to home" icon="arrow_back" href="/" background="glass" size="m"></e-form-button>
							</div>
						</e-banner>
					</div>
					<div class="form">
						<div class="holder">
							<div ot-if="loading" class="header">
								<h1>Signing out...</h1>
								<p>Just a moment while we log you out safely.</p>
							</div>

							<div ot-if="done" class="header">
								<h1>You've been signed out</h1>
								<p>Thanks for spending time on OneType Travel. We hope your next adventure is just around the corner.</p>
							</div>

							<div ot-if="done" class="actions">
								<e-form-button text="Sign in again" icon="login" href="/auth/login" color="dark" size="m" :variant="['full']"></e-form-button>
								<e-form-button text="Explore as guest" icon="explore" href="/" :variant="['bg-2', 'border', 'size-m', 'full']"></e-form-button>
							</div>
						</div>
					</div>
				</div>
			`;
		}
	});
});
