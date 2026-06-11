<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showCreate = $state(false);
	let activeTab = $state('spring');

	const tabs = [
		{ key: 'spring', label: 'Spring Boot' },
		{ key: 'env',    label: 'Environment' },
		{ key: 'curl',   label: 'cURL Test' },
		{ key: 'ca',     label: 'CA Certificate' }
	] as const;

	const total = $derived(data.vaults.length);

	const createdVault = $derived(
		form?.vaultName ? data.vaults.find((v) => v.name === (form as any).vaultName) : null
	);

	const setup = $derived(
		createdVault && form?.tenantId
			? {
					endpoint: `https://${createdVault.host}`,
					host: createdVault.host,
					name: createdVault.name,
					tenantId: form.tenantId,
					emulatorHost: (form as any).emulatorHost || 'localhost:13000',
					baseDomain: (form as any).baseDomain || 'kvemu.local'
				}
			: null
	);

	function copyText(text: string) {
		navigator.clipboard.writeText(text);
	}
</script>

<div class="mx-auto" style="max-width: 48rem;">
	<div class="page-header">
		<div>
			<h1 class="page-title">Vaults</h1>
			<p class="page-subtitle">Manage your key vault instances.</p>
		</div>
		<div class="flex gap-2">
			<a href="/vaults/import" class="btn btn-secondary">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
				</svg>
				Import
			</a>
			<button class="btn btn-primary" onclick={() => (showCreate = !showCreate)}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
					<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
				</svg>
				New Vault
			</button>
		</div>
	</div>

	<!-- Stats -->
	<div class="mb-5 grid grid-cols-1 gap-3">
		<div class="stat-card">
			<p class="stat-label">Total Vaults</p>
			<p class="stat-value">{total}</p>
		</div>
	</div>

	{#if form?.error}
		<div class="form-msg form-msg-error mb-4">{form.error}</div>
	{/if}

	<!-- Create form -->
	{#if showCreate}
		<form
			method="POST"
			action="?/create"
			use:enhance={() => { showCreate = false; }}
			class="animate-fade-in card mb-5"
		>
			<div class="card-header">
				<h2 class="text-sm font-semibold" style="color: var(--text-primary);">Create New Vault</h2>
			</div>
			<div class="card-body space-y-3">
				<div>
					<label class="mb-1 block text-xs font-medium" style="color: var(--text-muted);" for="vault-name">Vault Name</label>
					<input id="vault-name" type="text" name="name" required placeholder="my-vault" class="input" />
					<p class="mt-1 text-xs" style="color: var(--text-muted);">
						Hostname: <code>your-name.kvemu.local:13000</code>
					</p>
				</div>
				<div>
					<label class="mb-1 block text-xs font-medium" style="color: var(--text-muted);" for="vault-display-name">Display Name <span style="color: var(--text-muted);">(optional)</span></label>
					<input id="vault-display-name" type="text" name="display_name" placeholder="My Production Vault" class="input" />
				</div>
				<div class="flex gap-2 pt-1">
					<button type="submit" class="btn btn-primary">Create</button>
					<button type="button" class="btn btn-secondary" onclick={() => (showCreate = false)}>Cancel</button>
				</div>
			</div>
		</form>
	{/if}

	<!-- ===== Setup Guide (after vault creation) ===== -->
	{#if form?.success && setup}
		<div class="animate-fade-in card mb-5" style="border-color: rgba(45, 212, 191, 0.25);">
			<div class="card-header" style="border-color: rgba(45, 212, 191, 0.10);">
				<div class="flex items-center gap-2">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
					</svg>
					<span class="text-sm font-semibold" style="color: var(--accent);">Vault Created — Setup Guide</span>
				</div>
				<span class="badge badge-muted">{setup.name}</span>
			</div>

			<div class="card-body space-y-4">
				<p class="text-xs" style="color: var(--text-muted);">
					Follow the steps below to integrate your application with this vault. The fake AAD accepts any <strong>client_id</strong> and <strong>client_secret</strong> — the values below are suggestions.
				</p>

				<!-- Tab pills -->
				<div class="flex gap-1 rounded-lg p-0.5" style="background: var(--bg-elevated); width: fit-content;">
					{#each tabs as tab (tab.key)}
						<button
							class="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
							style={activeTab === tab.key
								? 'background: var(--accent-subtle); color: var(--accent);'
								: 'color: var(--text-muted);'}
							onclick={() => (activeTab = tab.key)}
						>
							{tab.label}
						</button>
					{/each}
				</div>

				<!-- Spring Boot tab -->
				{#if activeTab === 'spring'}
					<div class="space-y-4">
						<div>
							<p class="mb-2 text-xs font-semibold" style="color: var(--text-secondary);">1. Add Maven dependency</p>
							<div class="relative rounded-lg p-3" style="background: var(--bg-input);">
								<button
									class="absolute right-2 top-2 btn btn-ghost btn-sm"
									aria-label="Copy"
									onclick={() => copyText(`<dependency>
    <groupId>com.azure.spring</groupId>
    <artifactId>spring-cloud-azure-starter-keyvault-secrets</artifactId>
    <version>5.21.0</version>
</dependency>`)}
								>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
									</svg>
								</button>
								<pre class="mono text-xs leading-relaxed" style="background: transparent; padding: 0; color: var(--text-secondary); overflow-x: auto;">{`<dependency>
    <groupId>com.azure.spring</groupId>
    <artifactId>spring-cloud-azure-starter-keyvault-secrets</artifactId>
    <version>5.21.0</version>
</dependency>`}</pre>
							</div>
						</div>

						<div>
							<p class="mb-2 text-xs font-semibold" style="color: var(--text-secondary);">2. Add <code class="text-xs">application.properties</code></p>
							<div class="relative rounded-lg p-3" style="background: var(--bg-input);">
								<button
									class="absolute right-2 top-2 btn btn-ghost btn-sm"
									aria-label="Copy"
									onclick={() => copyText(`# Key Vault endpoint
spring.cloud.azure.keyvault.secret.property-sources[0].endpoint=${setup.endpoint}
spring.cloud.azure.keyvault.secret.property-sources[0].name=${setup.name}
spring.cloud.azure.keyvault.secret.property-sources[0].refresh-interval=30m

# Tenant and credentials (kvemu fake AAD)
spring.cloud.azure.profile.tenant-id=${setup.tenantId}
spring.cloud.azure.credential.client-id=your-app-id
spring.cloud.azure.credential.client-secret=your-app-secret

# Resolve secrets into Spring properties
app.db-password=\${DB_PASSWORD}
app.api-key=\${API_KEY}`)}
								>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
									</svg>
								</button>
								<pre class="mono text-xs leading-relaxed" style="background: transparent; padding: 0; color: var(--text-secondary); overflow-x: auto;">{`# Key Vault endpoint
spring.cloud.azure.keyvault.secret.property-sources[0].endpoint=${setup.endpoint}
spring.cloud.azure.keyvault.secret.property-sources[0].name=${setup.name}
spring.cloud.azure.keyvault.secret.property-sources[0].refresh-interval=30m

# Tenant and credentials (kvemu fake AAD)
spring.cloud.azure.profile.tenant-id=${setup.tenantId}
spring.cloud.azure.credential.client-id=your-app-id
spring.cloud.azure.credential.client-secret=your-app-secret

# Resolve secrets into Spring properties
app.db-password=\${DB_PASSWORD}
app.api-key=\${API_KEY}`}</pre>
							</div>
						</div>

						<div>
							<p class="mb-2 text-xs font-semibold" style="color: var(--text-secondary);">3. Use secrets in code</p>
							<div class="relative rounded-lg p-3" style="background: var(--bg-input);">
								<button
									class="absolute right-2 top-2 btn btn-ghost btn-sm"
									aria-label="Copy"
									onclick={() => copyText(`@Value("\${app.db-password}")
private String dbPassword;

@Value("\${app.api-key}")
private String apiKey;`)}
								>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
									</svg>
								</button>
								<pre class="mono text-xs leading-relaxed" style="background: transparent; padding: 0; color: var(--text-secondary); overflow-x: auto;">{`import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AppConfig {

    @Value("\${app.db-password}")
    private String dbPassword;

    @Value("\${app.api-key}")
    private String apiKey;

    public String getDbPassword() { return dbPassword; }
    public String getApiKey() { return apiKey; }
}`}</pre>
							</div>
						</div>
					</div>
				{/if}

				<!-- Environment tab -->
				{#if activeTab === 'env'}
					<div class="space-y-3">
						<p class="text-xs" style="color: var(--text-muted);">
							Set these environment variables in your application or <code class="text-xs">.env</code> file.
						</p>
						<div class="relative rounded-lg p-3" style="background: var(--bg-input);">
							<button
								class="absolute right-2 top-2 btn btn-ghost btn-sm"
								aria-label="Copy"
								onclick={() => copyText(`AZURE_KEYVAULT_ENDPOINT=${setup.endpoint}
AZURE_TENANT_ID=${setup.tenantId}
AZURE_CLIENT_ID=your-app-id
AZURE_CLIENT_SECRET=your-app-secret`)}
							>
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
								</svg>
							</button>
							<pre class="mono text-xs leading-relaxed" style="background: transparent; padding: 0; color: var(--text-secondary); overflow-x: auto;">{`AZURE_KEYVAULT_ENDPOINT=${setup.endpoint}
AZURE_TENANT_ID=${setup.tenantId}
AZURE_CLIENT_ID=your-app-id
AZURE_CLIENT_SECRET=your-app-secret`}</pre>
						</div>
						<div class="rounded-lg p-3" style="background: var(--warning-subtle); border: 1px solid rgba(251, 191, 36, 0.20);">
							<p class="text-xs font-medium" style="color: var(--warning);">DNS Setup</p>
							<p class="mt-1 text-xs" style="color: var(--text-secondary);">
								Your app must be able to resolve <code class="mono text-xs" style="background: transparent; padding: 0;">{setup.host}</code>.
								If running <strong>inside Docker Compose</strong>, the internal network resolves it automatically.
								If running <strong>locally</strong>, add to your <code class="text-xs">/etc/hosts</code>:
							</p>
							<div class="mt-2 rounded p-2" style="background: var(--bg-input);">
								<code class="mono text-xs" style="background: transparent; padding: 0; color: var(--text-secondary);">127.0.0.1 {setup.host}</code>
							</div>
						</div>
					</div>
				{/if}

				<!-- cURL tab -->
				{#if activeTab === 'curl'}
					<div class="space-y-3">
						<p class="text-xs" style="color: var(--text-muted);">
							Test your vault directly with <code class="text-xs">curl</code>. The emulator uses self-signed TLS — use <code class="text-xs">--insecure</code> or <code class="text-xs">--cacert</code>.
						</p>

						<div>
							<p class="mb-1.5 text-xs font-semibold" style="color: var(--text-secondary);">1. Get an access token</p>
							<div class="relative rounded-lg p-3" style="background: var(--bg-input);">
								<button
									class="absolute right-2 top-2 btn btn-ghost btn-sm"
									aria-label="Copy"
									onclick={() => copyText(`curl -sk -X POST https://${setup.emulatorHost}/${setup.tenantId}/oauth2/v2.0/token \\
  -d 'grant_type=client_credentials' \\
  -d 'client_id=test-client' \\
  -d 'client_secret=test-secret' \\
  -d 'scope=https://${setup.emulatorHost}/.default'`)}
								>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
									</svg>
								</button>
								<pre class="mono text-xs leading-relaxed" style="background: transparent; padding: 0; color: var(--text-secondary); overflow-x: auto;">{`# Step 1: Get a JWT token
TOKEN=$(curl -sk -X POST https://${setup.emulatorHost}/${setup.tenantId}/oauth2/v2.0/token \\
  -d 'grant_type=client_credentials' \\
  -d 'client_id=test-client' \\
  -d 'client_secret=test-secret' \\
  -d 'scope=https://${setup.emulatorHost}/.default' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)`}</pre>
							</div>
						</div>

						<div>
							<p class="mb-1.5 text-xs font-semibold" style="color: var(--text-secondary);">2. List secrets</p>
							<div class="relative rounded-lg p-3" style="background: var(--bg-input);">
								<button
									class="absolute right-2 top-2 btn btn-ghost btn-sm"
									aria-label="Copy"
									onclick={() => copyText(`curl -sk ${setup.endpoint}/secrets?api-version=7.4 \\
  -H "Authorization: Bearer $TOKEN"`)}
								>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
									</svg>
								</button>
								<pre class="mono text-xs leading-relaxed" style="background: transparent; padding: 0; color: var(--text-secondary); overflow-x: auto;">{`# Step 2: Use the token to access the vault
curl -sk ${setup.endpoint}/secrets?api-version=7.4 \\
  -H "Authorization: Bearer $TOKEN"`}</pre>
							</div>
						</div>
					</div>
				{/if}

				<!-- CA Certificate tab -->
				{#if activeTab === 'ca'}
					<div class="space-y-4">
						<p class="text-xs" style="color: var(--text-muted);">
							kvemu generates a self-signed CA on first boot. Import it into your application's truststore.
						</p>

						<div>
							<p class="mb-1.5 text-xs font-semibold" style="color: var(--text-secondary);">1. Export the CA certificate from kvemu</p>
							<div class="relative rounded-lg p-3" style="background: var(--bg-input);">
								<button
									class="absolute right-2 top-2 btn btn-ghost btn-sm"
									aria-label="Copy"
									onclick={() => copyText('docker compose exec kvemu /kvemu ca export')}
								>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
									</svg>
								</button>
								<pre class="mono text-xs leading-relaxed" style="background: transparent; padding: 0; color: var(--text-secondary); overflow-x: auto;">{`# Docker: export CA from emulator container
docker compose exec kvemu /kvemu ca export

# Or download from healthz endpoint
curl -sko ca.pem https://${setup.emulatorHost}/ca.pem`}</pre>
							</div>
						</div>

						<div>
							<p class="mb-1.5 text-xs font-semibold" style="color: var(--text-secondary);">2. Import into Java truststore</p>
							<div class="relative rounded-lg p-3" style="background: var(--bg-input);">
								<button
									class="absolute right-2 top-2 btn btn-ghost btn-sm"
									aria-label="Copy"
									onclick={() => copyText(`keytool -importcert -noprompt \\
  -alias kvemu-ca \\
  -file ca.pem \\
  -keystore $JAVA_HOME/lib/security/cacerts \\
  -storepass changeit`)}
								>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
									</svg>
								</button>
								<pre class="mono text-xs leading-relaxed" style="background: transparent; padding: 0; color: var(--text-secondary); overflow-x: auto;">keytool -importcert -noprompt \\
  -alias kvemu-ca \\
  -file ca.pem \\
  -keystore $JAVA_HOME/lib/security/cacerts \\
  -storepass changeit</pre>
							</div>
						</div>

						<div>
							<p class="mb-1.5 text-xs font-semibold" style="color: var(--text-secondary);">3. Or use system property in Java</p>
							<div class="relative rounded-lg p-3" style="background: var(--bg-input);">
								<button
									class="absolute right-2 top-2 btn btn-ghost btn-sm"
									aria-label="Copy"
									onclick={() => copyText(`-Djavax.net.ssl.trustStore=/path/to/custom-truststore.jks \\
-Djavax.net.ssl.trustStorePassword=changeit`)}
								>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
									</svg>
								</button>
								<pre class="mono text-xs leading-relaxed" style="background: transparent; padding: 0; color: var(--text-secondary); overflow-x: auto;">-Djavax.net.ssl.trustStore=/path/to/custom-truststore.jks \\
-Djavax.net.ssl.trustStorePassword=changeit</pre>
							</div>
						</div>
					</div>
				{/if}

				<div class="flex gap-2 pt-1">
					<a href="/vaults/{setup.name}/export" class="btn btn-secondary btn-sm">Export Vault</a>
					<button
						class="btn btn-ghost btn-sm"
						onclick={() => {
							form = null;
						}}
					>
						Dismiss
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- ===== Vaults Table ===== -->
	{#if data.vaults.length === 0}
		<div class="empty-state">
			<svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
			</svg>
			<p class="empty-state-title">No vaults found</p>
			<p class="empty-state-desc">Create your first vault to start managing secrets, keys, and certificates.</p>
		</div>
	{:else}
		<div class="table-container">
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Display Name</th>
						<th>Host</th>
						<th class="text-right">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.vaults as vault}
						<tr>
							<td>
								<span class="font-medium mono" style="background: transparent; padding: 0;">{vault.name}</span>
							</td>
							<td style="color: var(--text-secondary);">{vault.displayName || '—'}</td>
							<td>
								<code class="text-xs" style="color: var(--text-muted);">{vault.host}</code>
							</td>
							<td class="text-right">
								<div class="flex justify-end gap-1.5">
									<a href="/vaults/{vault.name}/export" class="btn btn-secondary btn-sm">Export</a>
									<form method="POST" action="?/delete" use:enhance class="inline">
										<input type="hidden" name="name" value={vault.name} />
										<button
											type="submit"
											class="btn btn-danger btn-sm"
											onclick={(e) => { if (!confirm(`Delete vault "${vault.name}" and ALL its secrets, keys, and certificates?`)) e.preventDefault(); }}
										>
											Delete
										</button>
									</form>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
