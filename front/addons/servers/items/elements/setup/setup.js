onetype.AddonReady('elements', (elements) =>
{
	elements.ItemAdd({
		id: 'server-setup',
		config:
		{
			item:
			{
				type: 'object',
				value: null,
				description: 'Server row from servers addon.'
			},
			gateways:
			{
				type: 'array',
				value: [],
				description: 'Available gateways.'
			}
		},
		render: function()
		{
			/* ===== STATE ===== */

			this.passphrase = '';
			this.gatewayId = '';
			this.testing = false;
			this.tested = false;
			this.connected = false;

			/* ===== DERIVED ===== */

			this.Compute(() =>
			{
				this.gatewayOptions = this.gateways.map((gateway) =>
				{
					return {
						label: gateway.name,
						value: String(gateway.id),
						description: gateway.host + ':' + gateway.port
					};
				});

				if(!this.gatewayId && this.gateways.length)
				{
					this.gatewayId = String(this.gateways[0].id);
				}
			});

			/* ===== HELPERS ===== */

			this.resolveGateway = () =>
			{
				return this.gateways.find((gateway) => String(gateway.id) === this.gatewayId);
			};

			this.buildCommand = () =>
			{
				const gateway = this.resolveGateway();

				if(!gateway || !this.item)
				{
					return '';
				}

				const parts =
				[
					'curl -fsSL https://mesh.onetype.ai/install.sh | sudo',
					'MESH_TOKEN=' + this.item.token,
					'MESH_GATEWAY=' + gateway.host + ':' + gateway.port
				];

				if(this.passphrase)
				{
					parts.push('MESH_PASSPHRASE=' + this.passphrase);
				}

				parts.push('bash');

				return parts.join(' ');
			};

			/* ===== HANDLERS ===== */

			this.changeGateway = ({ value }) =>
			{
				this.gatewayId = value;
			};

			this.changePassphrase = ({ value }) =>
			{
				this.passphrase = value;
			};

			this.test = async () =>
			{
				this.testing = true;

				const { data, code } = await $ot.command('servers:ping', { id: this.item.id });

				this.connected = code === 200 && data && data.connected === true;
				this.tested = true;
				this.testing = false;
			};

			/* ===== RENDER ===== */

			return /* html */ `
				<div class="box">
					<e-form-section
						eyebrow="Step 1"
						title="Where should the agent connect"
						description="Pick the Mesh gateway your server will dial over gRPC. For self-hosted setups, add your own gateway first."
						:variant="['clean']"
					>
						<div slot="content">
							<e-form-field label="Gateway" :required="true" :variant="['clean']">
								<div slot="input">
									<e-form-select
										:value="gatewayId"
										:options="gatewayOptions"
										:_change="changeGateway"
										placeholder="Select gateway…"
										background="bg-3"
									></e-form-select>
								</div>
							</e-form-field>
						</div>
					</e-form-section>

					<e-form-section
						eyebrow="Step 2"
						title="Optional passphrase"
						description="Set a passphrase to require hash-based command approval. Leave empty to run without approval gating."
						:variant="['clean']"
					>
						<div slot="content">
							<e-form-field label="Passphrase" :variant="['clean']">
								<div slot="input">
									<e-form-input
										type="password"
										:value="passphrase"
										:_input="changePassphrase"
										placeholder="Enter a passphrase (optional)…"
										background="bg-3"
									></e-form-input>
								</div>
							</e-form-field>
						</div>
					</e-form-section>

					<e-form-section
						eyebrow="Step 3"
						title="Run this on your machine"
						description="Copy the command and paste it into a terminal on the target Linux or macOS box. The agent will install as a service and dial the gateway."
						:variant="['clean']"
					>
						<div slot="content">
							<e-global-code
								:source="buildCommand()"
								language="bash"
								filename="install.sh"
								background="bg-3"
								size="m"
							></e-global-code>
						</div>
					</e-form-section>

					<e-form-section
						eyebrow="Step 4"
						title="Test connection"
						description="Run a quick echo on the agent to confirm the gateway can reach it and commands get through."
						:variant="['clean']"
					>
						<div slot="content">
							<div class="test">
								<e-form-button
									text="Test connection"
									icon="network_check"
									color="brand"
									tone="soft"
									:loading="testing"
									:_click="test"
								></e-form-button>

								<span ot-if="tested && connected" class="test-status ok">
									<i>check_circle</i>
									Agent connected and responding.
								</span>

								<span ot-if="tested && !connected" class="test-status fail">
									<i>error</i>
									Agent did not respond. Check the install step.
								</span>
							</div>
						</div>
					</e-form-section>
				</div>
			`;
		}
	});
});
