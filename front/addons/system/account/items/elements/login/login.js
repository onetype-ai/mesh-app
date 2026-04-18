onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'account-login',
		icon: 'login',
		name: 'Auth Login',
		description: 'Travel login form with split layout and hero showcase.',
		category: 'Account',
		author: 'OneType',
		render: function()
		{
			this.returnUrl = null;
			this.login = null;

			const params = new URLSearchParams(window.location.search);
			const value = params.get('return');

			if(value && value.startsWith('/'))
			{
				this.returnUrl = value;
			}

			this.onSuccess = async () =>
			{
				const response = await fetch('/api/auth/me');
				const result = await response.json();

				if(result.data && result.data.user)
				{
					onetype.StateSet('user', result.data.user);
				}

				if(this.returnUrl)
				{
					$ot.page(this.returnUrl);
					return;
				}

				$ot.page('/');
			};

			return /* html */ `
				<div class="split">
					<div class="showcase">
						<e-banner
							image="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1800&q=80"
							eyebrow="OneType Travel"
							title="Where will <em>your story</em><br/>unfold next?"
							description="Sign in to plan trips, save places, write stories, and manage your listings — all in one place."
						>
							<div slot="bottom">
								<e-form-button text="Go back" icon="arrow_back" href="/" background="glass" size="m"></e-form-button>
							</div>
						</e-banner>
					</div>
					<div class="form">
						<div class="holder">
							<div class="header">
								<h1>Welcome back</h1>
								<p>Sign in to your OneType Travel account</p>
							</div>

							<e-global-notice ot-if="login && login.code !== 200" icon="error" :text="login.message" color="red"></e-global-notice>

							<ot-form post="/api/auth/login" bind="login" :_success="onSuccess">
								<div class="auth-field">
									<label>Email</label>
									<e-form-input type="email" name="email" placeholder="you@traveller.com" background="bg-2" :variant="['border']"></e-form-input>
								</div>
								<div class="auth-field">
									<label>Password</label>
									<e-form-input type="password" name="password" placeholder="Enter your password" background="bg-2" :variant="['border']"></e-form-input>
								</div>
								<e-form-button text="Sign in" icon="arrow_forward" color="dark" size="m" :variant="['full']" :loading="login.loading" type="submit"></e-form-button>
							</ot-form>

							<div class="footer">
								<span>New to OneType Travel?</span>
								<a :href="returnUrl ? '/auth/register?return=' + encodeURIComponent(returnUrl) : '/auth/register'">Create an account</a>
							</div>
						</div>
					</div>
				</div>
			`;
		}
	});
});
