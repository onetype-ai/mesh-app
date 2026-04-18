onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'account-register',
		icon: 'person_add',
		name: 'Auth Register',
		description: 'Travel registration form with password rules and split hero showcase.',
		category: 'Account',
		author: 'OneType',
		render: function()
		{
			this.password = '';
			this.register = null;

			this.rules = [
				{ id: 'length', label: '8 characters minimum', test: (v) => v.length >= 8 },
				{ id: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
				{ id: 'number', label: 'One number', test: (v) => /[0-9]/.test(v) },
				{ id: 'special', label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) }
			];

			this.ruleStatus = (rule) =>
			{
				if(!this.password) return 'neutral';
				return rule.test(this.password) ? 'pass' : 'fail';
			};

			this.returnUrl = null;

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

			this.onPassword = ({ value }) =>
			{
				this.password = value;
				this.Update();
			};

			return /* html */ `
				<div class="split">
					<div class="showcase">
						<e-banner
							image="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1800&q=80"
							eyebrow="OneType Travel"
							title="Start your <em>next chapter</em>."
							description="Create your free account and join thousands of travellers who plan, share, and discover with OneType Travel."
						>
							<div slot="bottom">
								<e-form-button text="Go back" icon="arrow_back" href="/" background="glass" size="m"></e-form-button>
							</div>
						</e-banner>
					</div>
					<div class="form">
						<div class="holder">
							<div class="header">
								<h1>Create your account</h1>
								<p>Join OneType Travel and start exploring</p>
							</div>

							<e-global-notice ot-if="register && register.code !== 200" icon="error" :text="register.message" color="red"></e-global-notice>

							<ot-form post="/api/auth/register" bind="register" :_success="onSuccess">
								<div class="auth-field">
									<label>Name</label>
									<e-form-input name="name" placeholder="Your full name" background="bg-2" :variant="['border']"></e-form-input>
								</div>
								<div class="auth-field">
									<label>Email</label>
									<e-form-input type="email" name="email" placeholder="you@traveller.com" background="bg-2" :variant="['border']"></e-form-input>
								</div>
								<div class="auth-field">
									<label>Password</label>
									<e-form-input type="password" name="password" placeholder="Create a password" background="bg-2" :variant="['border']" :_input="onPassword"></e-form-input>
									<div class="rules">
										<div ot-for="rule in rules" :class="'rule ' + ruleStatus(rule)">
											<i ot-if="ruleStatus(rule) === 'pass'">check_circle</i>
											<i ot-if="ruleStatus(rule) === 'fail'">cancel</i>
											<i ot-if="ruleStatus(rule) === 'neutral'">radio_button_unchecked</i>
											<span>{{ rule.label }}</span>
										</div>
									</div>
								</div>
								<e-form-button text="Create account" icon="arrow_forward" color="dark" size="m" :variant="['full']" :loading="register.loading" type="submit"></e-form-button>
							</ot-form>

							<div class="footer">
								<span>Already have an account?</span>
								<a :href="returnUrl ? '/auth/login?return=' + encodeURIComponent(returnUrl) : '/auth/login'">Sign in</a>
							</div>
						</div>
					</div>
				</div>
			`;
		}
	});
});
