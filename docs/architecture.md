# Architecture

**[🇺🇸 English](#english) · [🇧🇷 Português](#português)**

---

<a id="english"></a>
## 🇺🇸 English

### Overview

```
┌──────────────────────┐        HTTPS (self-signed TLS)        ┌────────────────────────────┐
│   kv-interface        │ ──────────────────────────────────▶ │   kvemu                     │
│   (SvelteKit / Node)  │   OAuth2 client_credentials          │   (Go / chi / SQLite)       │
│   port 3000           │   api-version=7.4                    │   port 13000 (REST API 7.4) │
└──────────────────────┘                                      └────────────────────────────┘
```

### Directory Structure

```
src/
├── app.css                          # Tailwind 4 + Secure Console dark theme design system
├── app.d.ts                         # Type declarations (Locals.selectedVault)
├── app.html                         # Root HTML shell + Google Fonts (Sora, JetBrains Mono)
├── hooks.server.ts                  # Cookie selected_vault → event.locals (v1.1)
├── lib/
│   ├── assets/favicon.svg           # Favicon
│   └── server/
│       └── keyvault.ts              # ★ KeyVaultClient class + management API (v1.1)
└── routes/
    ├── +layout.svelte               # App shell: dark sidebar with icons + topbar + vault selector
    ├── +layout.server.ts            # Loads vaults list + selectedVault
    ├── +error.svelte                # Error page (centered dark card)
    ├── +page.server.ts              # Root → 302 redirect to /secrets
    ├── api/select-vault/            # POST — set cookie + redirect (v1.1)
    ├── secrets/
    │   ├── +page.server.ts          # List secrets (load) + create/delete (actions)
    │   ├── +page.svelte             # Stats cards + table + inline create form
    │   └── [name]/
    │       ├── +page.server.ts      # Single secret detail (load) + delete (action)
    │       └── +page.svelte         # Detail: id, value (reveal/copy), metadata, danger zone
    ├── keys/
    │   ├── +page.server.ts          # List keys (load)
    │   └── +page.svelte             # Stats cards + keys table (read-only)
    ├── certificates/
    │   ├── +page.server.ts          # List certificates (load)
    │   └── +page.svelte             # Stats cards + certificates table (read-only)
    └── vaults/                      # Multi-vault management (v1.1)
        ├── +page.server.ts          # Load vaults + create/delete (actions)
        ├── +page.svelte             # Vaults table + inline create + export/delete
        ├── import/
        │   ├── +page.server.ts      # Import vault (action)
        │   └── +page.svelte         # File upload + JSON preview + import result
        └── [name]/export/
            └── +server.ts           # Proxy vault export as JSON download
```

### API Endpoints (consumed from kvemu)

#### Auth (no Bearer token required)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/{tenant}/oauth2/v2.0/token` | Obtain JWT via client_credentials |

#### Data-plane (Bearer token required, `?api-version=7.4`)

| Method | Path | Function |
|---|---|---|
| `GET` | `/secrets` | `listSecrets()` |
| `GET` | `/secrets/{name}` | `getSecret(name)` |
| `PUT` | `/secrets/{name}` | `setSecret(name, value)` |
| `DELETE` | `/secrets/{name}` | `deleteSecret(name)` |
| `GET` | `/keys` | `listKeys()` |
| `GET` | `/certificates` | `listCertificates()` |

#### Management (v1.1, no AAD auth)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/vaults` | `listVaults()` |
| `POST` | `/vaults` | `createVault(name, displayName?)` |
| `GET` | `/vaults/{name}` | `getVault(name)` |
| `DELETE` | `/vaults/{name}` | `deleteVault(name)` |
| `GET` | `/vaults/{name}/export` | `exportVault(name)` |
| `POST` | `/vaults/import` | `importVault(data)` |

### Authentication Flow

The UI authenticates against kvemu's fake AAD using the standard OAuth2 `client_credentials` flow:

```
kv-interface                     kvemu
      |                            |
      |-- POST /{tenant}/oauth2/v2.0/token -->|
      |    grant_type=client_credentials       |
      |    client_id=kv-interface              |
      |    client_secret=kv-interface-secret    |
      |    scope=https://{host}/.default        |
      |<-------- 200 (JWT) -------------------|
      |                            |
      |-- GET /secrets?api-version=7.4 ------->|
      |    Authorization: Bearer <jwt>          |
      |<-------- 200 (JSON) ------------------|
```

1. UI sends `POST` to the token endpoint with form-encoded body
2. kvemu responds with `{ "access_token": "...", "expires_in": 3600 }`
3. Token is cached in memory (80% of `expires_in`, max 25 minutes)
4. All data-plane requests include the `Authorization: Bearer <token>` header
5. On 401 or 403: cache is cleared, a fresh token is obtained, and the request is retried once

**Scope** is dynamically constructed from `KEYVAULT_EMULATOR_URL` by extracting the `host:port` portion. Token is shared across all vaults (same tenant, same JWT key).

### Response Types

```typescript
// List response (secrets, keys, certificates)
interface VaultItemList {
  value: VaultItem[];
  nextLink?: string | null;
}

interface VaultItem {
  id: string;              // "https://host/secrets/{name}/{version}"
  attributes?: {
    enabled?: boolean;
    created?: number;      // epoch seconds
    updated?: number;
    expires?: number | null;
  };
  tags?: Record<string, string>;
}

// Secret detail (extends VaultItem)
interface SecretBundle extends VaultItem {
  value?: string;
  contentType?: string | null;
}
```

> **Item name extraction:** The name is the second-to-last path segment of the `id` field (e.g., `https://host/secrets/my-secret/abc123` → `my-secret`). The last segment is always the version GUID.

---

<a id="português"></a>
## 🇧🇷 Português

### Visão Geral

```
┌──────────────────────┐        HTTPS (TLS autoassinado)        ┌────────────────────────────┐
│   kv-interface        │ ──────────────────────────────────▶ │   kvemu                     │
│   (SvelteKit / Node)  │   OAuth2 client_credentials          │   (Go / chi / SQLite)       │
│   porta 3000          │   api-version=7.4                    │   porta 13000 (REST API 7.4)│
└──────────────────────┘                                      └────────────────────────────┘
```

### Estrutura de Diretórios

```
src/
├── app.css                          # Tailwind 4 + design system dark Secure Console
├── app.d.ts                         # Declarações de tipo (Locals.selectedVault)
├── app.html                         # Shell HTML raiz + Google Fonts
├── hooks.server.ts                  # Cookie selected_vault → event.locals (v1.1)
├── lib/
│   ├── assets/favicon.svg           # Favicon
│   └── server/
│       └── keyvault.ts              # ★ KeyVaultClient class + management API (v1.1)
└── routes/
    ├── +layout.svelte               # Shell: sidebar com ícones + topbar + seletor de vault (v1.1)
    ├── +layout.server.ts            # Carrega lista de vaults + selectedVault (v1.1)
    ├── +error.svelte                # Página de erro (card centrado, tema dark)
    ├── +page.server.ts              # Raiz → redirect 302 para /secrets
    ├── api/select-vault/            # POST → seta cookie + redirect (v1.1)
    ├── secrets/
    │   ├── +page.server.ts          # Listar secrets (load) + criar/deletar (actions)
    │   ├── +page.svelte             # Stats cards + tabela + formulário inline de criação
    │   └── [name]/
    │       ├── +page.server.ts      # Detalhe do secret (load) + deletar (action)
    │       └── +page.svelte         # Detalhe: id, valor (mostrar/ocultar/copiar), metadados
    ├── keys/
    │   ├── +page.server.ts          # Listar keys (load)
    │   └── +page.svelte             # Stats + tabela (somente leitura)
    ├── certificates/
    │   ├── +page.server.ts          # Listar certificates (load)
    │   └── +page.svelte             # Stats + tabela (somente leitura)
    └── vaults/                      # Gestão multi-vault (v1.1)
        ├── +page.server.ts          # List + create/delete vaults
        ├── +page.svelte             # Stats + tabela CRUD + formulário inline
        ├── import/
        │   ├── +page.server.ts      # Ação de import
        │   └── +page.svelte         # Upload + preview JSON + resultado
        └── [name]/export/
            └── +server.ts           # Download do vault como JSON
```

### Endpoints da API (consumidos do kvemu)

#### Auth (sem Bearer token)

| Método | Caminho | Propósito |
|---|---|---|
| `POST` | `/{tenant}/oauth2/v2.0/token` | Obter JWT via client_credentials |

#### Data-plane (requer Bearer token, `?api-version=7.4`)

| Método | Caminho | Função |
|---|---|---|
| `GET` | `/secrets` | `listSecrets()` |
| `GET` | `/secrets/{name}` | `getSecret(name)` |
| `PUT` | `/secrets/{name}` | `setSecret(name, value)` |
| `DELETE` | `/secrets/{name}` | `deleteSecret(name)` |
| `GET` | `/keys` | `listKeys()` |
| `GET` | `/certificates` | `listCertificates()` |

#### Management (sem AAD auth, multi-vault v1.1)

| Método | Caminho | Função |
|---|---|---|
| `GET` | `/vaults` | `listVaults()` |
| `POST` | `/vaults` | `createVault(name, displayName)` |
| `GET` | `/vaults/{name}` | `getVault(name)` |
| `DELETE` | `/vaults/{name}` | `deleteVault(name)` |
| `GET` | `/vaults/{name}/export` | `exportVault(name)` |
| `POST` | `/vaults/import` | `importVault(data)` |

### Fluxo de Autenticação

A interface autentica contra o AAD fake do kvemu usando o fluxo OAuth2 `client_credentials` padrão:

```
kv-interface                     kvemu
      |                            |
      |-- POST /{tenant}/oauth2/v2.0/token -->|
      |    grant_type=client_credentials       |
      |    client_id=kv-interface              |
      |    client_secret=kv-interface-secret    |
      |    scope=https://{host}/.default        |
      |<-------- 200 (JWT) -------------------|
      |                            |
      |-- GET /secrets?api-version=7.4 ------->|
      |    Authorization: Bearer <jwt>          |
      |<-------- 200 (JSON) ------------------|
```

1. Interface envia `POST` para o endpoint de token com body form-encoded
2. kvemu responde com `{ "access_token": "...", "expires_in": 3600 }`
3. Token é cacheado em memória (80% do `expires_in`, máx 25 minutos)
4. Todas as requisições data-plane incluem o header `Authorization: Bearer <token>`
5. Em caso de 401 ou 403: cache é limpo, token fresco é obtido, requisição é reenviada uma vez

**Scope** é construído dinamicamente a partir de `KEYVAULT_EMULATOR_URL` extraindo a porção `host:port`. Token é compartilhado entre todos os vaults (mesmo tenant, mesma chave JWT).

### Tipos de Resposta

```typescript
// Resposta de lista (secrets, keys, certificates)
interface VaultItemList {
  value: VaultItem[];
  nextLink?: string | null;
}

interface VaultItem {
  id: string;              // "https://host/secrets/{nome}/{versao}"
  attributes?: {
    enabled?: boolean;
    created?: number;      // segundos epoch
    updated?: number;
    expires?: number | null;
  };
  tags?: Record<string, string>;
}

// Detalhe do secret (estende VaultItem)
interface SecretBundle extends VaultItem {
  value?: string;
  contentType?: string | null;
}
```

> **Extração do nome:** O nome é o penúltimo segmento do campo `id` (ex: `https://host/secrets/meu-secret/abc123` → `meu-secret`). O último segmento é sempre o GUID da versão.
