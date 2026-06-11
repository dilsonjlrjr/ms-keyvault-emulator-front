<script lang="ts">
  import { getContext } from 'svelte';
  import { t, type Lang } from '$lib/i18n';
  const lang = getContext<string>('lang') || 'en';
  const _ = (key: string) => t(key, lang);

  let activeTab = $state<'spring' | 'go'>('spring');

  // ── Spring Boot ────────────────────────────────────
  const springConfigEn = `# application.properties
spring.cloud.azure.keyvault.secret.property-sources[0].name=vault-secrets
spring.cloud.azure.keyvault.secret.property-sources[0].endpoint=\${AZURE_KEYVAULT_ENDPOINT}
spring.cloud.azure.keyvault.secret.property-sources[0].refresh-interval=30m

spring.cloud.azure.credential.client-id=\${AZURE_CLIENT_ID:dev-client}
spring.cloud.azure.credential.client-secret=\${AZURE_CLIENT_SECRET:dev-secret}
spring.cloud.azure.profile.tenant-id=\${AZURE_TENANT_ID}

# Property resolution: maps Key Vault secrets to Spring properties
app.cosmos.url=\${COSMO_DB_URL}
`;

  const springCodeEn = `@RestController
public class MyController {

    @Value("\${db-password}")
    private String dbPassword;

    @Value("\${api-key}")
    private String apiKey;

    @Value("\${connection-string}")
    private String connectionString;

    @Value("\${app.cosmos.url}")
    private String cosmosUrl;   // resolved from COSMO_DB_URL secret
}
`;

  const springCA = `# Linux (Debian/Ubuntu)
sudo cp ca.pem /usr/local/share/ca-certificates/kvemu.crt && sudo update-ca-certificates

# Linux (RHEL/Fedora)
sudo cp ca.pem /etc/pki/ca-trust/source/anchors/kvemu.crt && sudo update-ca-trust

# macOS
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ca.pem

# Windows (PowerShell — run as Administrator)
Import-Certificate -FilePath .\\ca.pem -CertStoreLocation Cert:\\LocalMachine\\Root
`;

  const springDocker = `services:
  myapp:
    build: .
    environment:
      AZURE_KEYVAULT_ENDPOINT: "https://vault.kvemu.local:13000"
      AZURE_CLIENT_ID:         "dev-client"
      AZURE_CLIENT_SECRET:     "dev-secret"
      AZURE_TENANT_ID:         "a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f"
    volumes:
      - certs:/certs:ro
`;

  // ── Go ─────────────────────────────────────────────
  const goClientEn = `package main

import (
    "bytes"
    "crypto/tls"
    "crypto/x509"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "net/url"
    "os"
)

func main() {
    baseURL := "https://localhost:13000"
    vaultHost := "localhost:13000"
    tenantID := "a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f"
    caPath := "./certs/ca.pem"

    caPEM, _ := os.ReadFile(caPath)
    pool := x509.NewCertPool()
    pool.AppendCertsFromPEM(caPEM)

    client := &http.Client{
        Transport: &http.Transport{
            TLSClientConfig: &tls.Config{RootCAs: pool},
        },
    }

    // Authenticate
    scope := fmt.Sprintf("https://%s/.default", vaultHost)
    tokenURL := fmt.Sprintf("%s/%s/oauth2/v2.0/token", baseURL, tenantID)
    resp, _ := client.PostForm(tokenURL, url.Values{
        "grant_type":    {"client_credentials"},
        "client_id":     {"dev-client"},
        "client_secret": {"dev-secret"},
        "scope":         {scope},
    })
    var result struct {
        AccessToken string \x60json:"access_token"\x60
    }
    json.NewDecoder(resp.Body).Decode(&result)
    resp.Body.Close()

    // Read a secret
    req, _ := http.NewRequest("GET",
        baseURL+"/secrets/db-password?api-version=7.4", nil)
    req.Header.Set("Authorization", "Bearer "+result.AccessToken)

    resp, _ = client.Do(req)
    body, _ := io.ReadAll(resp.Body)
    resp.Body.Close()
    fmt.Println(string(body))
}
`;

  const goSetEn = `body := map[string]any{
    "value": "my-secret-value",
}
b, _ := json.Marshal(body)

req, _ := http.NewRequest("PUT",
    baseURL+"/secrets/my-secret?api-version=7.4",
    bytes.NewReader(b))
req.Header.Set("Authorization", "Bearer "+token)
req.Header.Set("Content-Type", "application/json")

resp, _ := client.Do(req)
`;

  const goEncEn = `// Encrypt
encBody := map[string]any{
    "alg":   "RSA-OAEP-256",
    "value": "SGVsbG8gV29ybGQ=", // base64("Hello World")
}
b, _ := json.Marshal(encBody)
req, _ := http.NewRequest("POST",
    fmt.Sprintf("%s/keys/rsa-key-2048/%s/encrypt?api-version=7.4",
        baseURL, version), bytes.NewReader(b))
resp, _ := client.Do(req)

// Decrypt
decBody := map[string]any{
    "alg":   "RSA-OAEP-256",
    "value": encryptedValue, // from encrypt response
}
`;

  const goListEn = `req, _ := http.NewRequest("GET",
    baseURL+"/secrets?api-version=7.4&maxresults=25", nil)
req.Header.Set("Authorization", "Bearer "+token)

resp, _ := client.Do(req)
var page struct {
    Value    []map[string]any \x60json:"value"\x60
    NextLink *string          \x60json:"nextLink"\x60
}
json.NewDecoder(resp.Body).Decode(&page)
resp.Body.Close()
`;
</script>

{#snippet CodeBlock(content: string)}
  <pre class="mono text-xs leading-relaxed overflow-x-auto rounded-lg p-4" style="background: var(--bg-root); border: 1px solid var(--border-default);"><code>{content}</code></pre>
{/snippet}

<!-- Framework tabs -->
<div class="mb-5 flex gap-1 rounded-lg p-1" style="background: var(--bg-elevated); display: inline-flex;">
  <button
    class="rounded-md px-3 py-1.5 text-sm font-medium transition-all"
    class:btn-primary={activeTab === 'spring'}
    class:btn-ghost={activeTab !== 'spring'}
    style={activeTab === 'spring' ? '' : 'border: none;'}
    onclick={() => activeTab = 'spring'}
  >
    Spring Boot
  </button>
  <button
    class="rounded-md px-3 py-1.5 text-sm font-medium transition-all"
    class:btn-primary={activeTab === 'go'}
    class:btn-ghost={activeTab !== 'go'}
    style={activeTab === 'go' ? '' : 'border: none;'}
    onclick={() => activeTab = 'go'}
  >
    Go
  </button>
</div>

<!-- ── Local Machine Setup ───────────────────────── -->
<div class="card" style="margin-bottom: 1rem;">
  <div class="card-header">
    <h2 class="text-sm font-semibold">{_('integrations.local_setup')}</h2>
  </div>
  <div class="card-body space-y-4">
    <div>
      <h3 class="text-sm font-semibold" style="color: var(--text-primary); margin-bottom: 0.5rem;">
        1. {_('integrations.ca_download')}
      </h3>
      <p class="text-sm" style="color: var(--text-secondary); margin-bottom: 0.5rem;">
        {_('integrations.ca_desc')}
      </p>
      <a
        href="/ca"
        class="btn btn-primary btn-sm"
        download="ca.pem"
        style="margin-bottom: 0.5rem;"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.375rem;">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
        </svg>
        {_('integrations.ca_download')}
      </a>
      <p class="text-sm" style="color: var(--text-muted);">
        {_('integrations.ca_alt')}
      </p>
      <pre
        class="mono text-xs leading-relaxed overflow-x-auto rounded-lg p-3 mt-1"
        style="background: var(--bg-root); border: 1px solid var(--border-default);"
      ><code>docker cp kvemu:/certs/ca.pem ./ca.pem</code></pre>
    </div>

    <hr class="separator" />

    <div>
      <h3 class="text-sm font-semibold" style="color: var(--text-primary); margin-bottom: 0.5rem;">
        2. {_('integrations.hosts_title')}
      </h3>
      <p class="text-sm" style="color: var(--text-secondary); margin-bottom: 0.5rem;">
        {_('integrations.hosts_desc')}
      </p>
      <pre
        class="mono text-xs leading-relaxed overflow-x-auto rounded-lg p-3"
        style="background: var(--bg-root); border: 1px solid var(--border-default);"
      ><code># /etc/hosts — Key Vault Emulator
192.168.100.112 login.microsoftonline.com
192.168.100.112 lab-dilson
192.168.100.112 vault.kvemu.local</code></pre>
      <p class="text-sm" style="color: var(--text-muted); margin-top: 0.5rem;">
        Replace <code>192.168.100.112</code> with the actual IP of the machine running kvemu.
      </p>
    </div>

    <hr class="separator" />

    <div>
      <h3 class="text-sm font-semibold" style="color: var(--text-primary); margin-bottom: 0.5rem;">
        3. {_('integrations.hosts_java_title')}
      </h3>
      <p class="text-sm" style="color: var(--text-secondary); margin-bottom: 0.5rem;">
        {_('integrations.hosts_java_desc')}
      </p>
      <p class="text-sm" style="color: var(--text-secondary); margin-bottom: 0.5rem;">
        Create a custom hosts file:
      </p>
      <pre
        class="mono text-xs leading-relaxed overflow-x-auto rounded-lg p-3"
        style="background: var(--bg-root); border: 1px solid var(--border-default);"
      ><code># custom-hosts
192.168.100.112 login.microsoftonline.com
192.168.100.112 lab-dilson
192.168.100.112 vault.kvemu.local</code></pre>
      <p class="text-sm" style="color: var(--text-secondary); margin-bottom: 0.5rem; margin-top: 0.75rem;">
        Then set the JVM property to use it:
      </p>
      <pre
        class="mono text-xs leading-relaxed overflow-x-auto rounded-lg p-3"
        style="background: var(--bg-root); border: 1px solid var(--border-default);"
      ><code>JAVA_TOOL_OPTIONS=-Djdk.net.hosts.file=/path/to/custom-hosts</code></pre>
      <p class="text-sm" style="color: var(--text-muted); margin-top: 0.5rem;">
        This works from Java 8+ and overrides <code>/etc/hosts</code> for DNS resolution within the JVM only.
      </p>
    </div>
  </div>
</div>

<div class="animate-fade-in">
{#if activeTab === 'spring'}
  <div class="card" style="margin-bottom: 1rem;">
    <div class="card-header"><h2 class="text-sm font-semibold">{_('integrations.spring_config')}</h2></div>
    <div class="card-body">
      <p class="text-sm" style="color: var(--text-secondary); margin-bottom: 1rem;">Add the Key Vault Secret property source and configure credentials in your <code>application.properties</code>:</p>
      {@render CodeBlock(springConfigEn)}
    </div>
  </div>

  <div class="card" style="margin-bottom: 1rem;">
    <div class="card-header"><h2 class="text-sm font-semibold">{_('integrations.spring_code')}</h2></div>
    <div class="card-body">{@render CodeBlock(springCodeEn)}</div>
  </div>

  <div class="card" style="margin-bottom: 1rem;">
    <div class="card-header"><h2 class="text-sm font-semibold">{_('integrations.spring_ca')}</h2></div>
    <div class="card-body">
      <p class="text-sm" style="color: var(--text-secondary); margin-bottom: 1rem;">Import the CA certificate into your operating system trust store:</p>
      {@render CodeBlock(springCA)}
    </div>
  </div>

  <div class="card" style="margin-bottom: 1rem;">
    <div class="card-header"><h2 class="text-sm font-semibold">{_('integrations.spring_docker')}</h2></div>
    <div class="card-body">{@render CodeBlock(springDocker)}</div>
  </div>
{:else}
  <div class="card" style="margin-bottom: 1rem;">
    <div class="card-header"><h2 class="text-sm font-semibold">{_('integrations.go_client')}</h2></div>
    <div class="card-body">{@render CodeBlock(goClientEn)}</div>
  </div>

  <div class="card" style="margin-bottom: 1rem;">
    <div class="card-header"><h2 class="text-sm font-semibold">{_('integrations.go_set')}</h2></div>
    <div class="card-body">{@render CodeBlock(goSetEn)}</div>
  </div>

  <div class="card" style="margin-bottom: 1rem;">
    <div class="card-header"><h2 class="text-sm font-semibold">{_('integrations.go_encrypt')}</h2></div>
    <div class="card-body">{@render CodeBlock(goEncEn)}</div>
  </div>

  <div class="card" style="margin-bottom: 1rem;">
    <div class="card-header"><h2 class="text-sm font-semibold">{_('integrations.go_list')}</h2></div>
    <div class="card-body">{@render CodeBlock(goListEn)}</div>
  </div>
{/if}
</div>

<!-- Environment variables reference -->
<div class="card" style="margin-top: 2rem;">
  <div class="card-header">
    <h2 class="text-sm font-semibold">{_('integrations.env_ref')}</h2>
  </div>
  <div class="card-body">
    <div class="table-container" style="border: none;">
      <table style="margin: -1.25rem; width: calc(100% + 2.5rem);">
        <thead>
          <tr>
            <th>{_('integrations.env_var')}</th>
            <th>{_('integrations.env_desc')}</th>
            <th>{_('integrations.env_default')}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>KV_ADDR</code></td><td>Listen address</td><td><code>0.0.0.0:13000</code></td></tr>
          <tr><td><code>KV_VAULT_HOST</code></td><td>Vault hostname</td><td><code>vault.kvemu.local:13000</code></td></tr>
          <tr><td><code>KV_TENANT_ID</code></td><td>AAD tenant ID</td><td><code>a0c2a3f5-...</code></td></tr>
          <tr><td><code>KV_BASE_DOMAIN</code></td><td>Base domain for multi-vault</td><td><code>kvemu.local</code></td></tr>
          <tr><td><code>KV_DEFAULT_VAULT</code></td><td>Default vault name</td><td><code>vault</code></td></tr>
          <tr><td><code>KV_TLS_AUTO</code></td><td>Auto-generate TLS cert</td><td><code>true</code></td></tr>
          <tr><td><code>KV_TLS_SAN</code></td><td>Additional TLS SANs</td><td>—</td></tr>
          <tr><td><code>KV_AUTH_STRICT</code></td><td>Validate JWT signature</td><td><code>false</code></td></tr>
          <tr><td><code>KV_MASTER_KEY</code></td><td>At-rest encryption key</td><td>—</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Compatibility table -->
<div class="card" style="margin-top: 1rem;">
  <div class="card-header">
    <h2 class="text-sm font-semibold">{_('integrations.compat')}</h2>
  </div>
  <div class="card-body">
    <div class="table-container" style="border: none;">
      <table style="margin: -1.25rem; width: calc(100% + 2.5rem);">
        <thead>
          <tr>
            <th>{_('integrations.spring_boot')}</th>
            <th>Spring Cloud Azure</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>2.7.9</code></td><td><code>4.5.0</code></td><td><span class="badge badge-success">{_('integrations.compatible')}</span></td></tr>
          <tr><td><code>2.7.18</code></td><td><code>4.5.0</code></td><td><span class="badge badge-success">{_('integrations.compatible')}</span></td></tr>
          <tr><td><code>3.4.5</code></td><td><code>5.21.0</code></td><td><span class="badge badge-success">{_('integrations.compatible')}</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
