# kv-interface — Key Vault Emulator Web UI

**[🇺🇸 English](#english) · [🇧🇷 Português](#português)**

---

<a id="english"></a>
## 🇺🇸 English

### About

**kv-interface** is the web dashboard for [**kvemu**](../backend) — an Azure Key Vault emulator implementing the data-plane API 7.4. It provides a browser UI to view, create, and delete **Secrets**, and list **Keys** and **Certificates** stored in the emulator.

**Stack:** SvelteKit 2 (Svelte 5 runes) · TypeScript 6 · Tailwind CSS 4 · Vite 8 · adapter-node · undici · Dark "Secure Console" visual theme

---

### Quick Start (Docker)

With Docker installed, start both the emulator and the UI:

```bash
docker compose up --build
```

This launches two services (see [`docker-compose.yml`](./docker-compose.yml)):

- **`kvemu`** — built from `../backend`, exposed on `https://localhost:13000`, with auto-generated TLS, persistent SQLite storage, and a fake AAD identity provider.
- **`kv-interface`** — this UI, exposed on `http://localhost:3000`, configured to find the emulator at `https://kvemu:13000` (resolved by the internal Compose network).

Open the UI at **http://localhost:3000**.

---

### Quick Start (Local Development)

For local development, run the frontend directly (the kvemu emulator must already be running):

```bash
cp .env.example .env          # edit KEYVAULT_EMULATOR_URL and KEYVAULT_TENANT_ID if needed
npm install
npm run dev -- --open
```

Make sure kvemu is running (e.g., via `make run` in the backend directory). The `.env.example` points to `https://localhost:13000` by default.

---

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `KEYVAULT_EMULATOR_URL` | `https://localhost:13000` | Base URL of the kvemu emulator |
| `KEYVAULT_TENANT_ID` | `a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f` | AAD tenant ID for OAuth2 token endpoint |
| `KEYVAULT_TITLE` | `One Keyvault` | Title displayed in the sidebar ("kvemu — {title}") |
| `KEYVAULT_BASE_DOMAIN` | `kvemu.local` | Base domain for vault subdomains (v1.1) |
| `KEYVAULT_DEFAULT_VAULT` | `vault` | Default vault name when no cookie is set (v1.1) |
| `PORT` | `3000` | SvelteKit server listen port |
| `ORIGIN` | `http://localhost:3000` | Public origin for form validation / CSRF |

> TLS certificate validation is disabled (`rejectUnauthorized: false`) when talking to the emulator — kvemu uses self-signed certificates for local development. **Never point this at a production Azure Key Vault.**

---

### Architecture

```
┌──────────────────────┐        HTTPS (self-signed TLS)        ┌────────────────────────────┐
│   kv-interface        │ ──────────────────────────────────▶ │   kvemu                     │
│   (SvelteKit / Node)  │   OAuth2 client_credentials          │   (Go / chi / SQLite)       │
│   port 3000           │   api-version=7.4                    │   port 13000 (REST API 7.4) │
└──────────────────────┘                                      └────────────────────────────┘
```

```
src/
├── app.css                          # Tailwind 4 + Secure Console dark theme
├── app.d.ts                         # Type declarations (Locals.selectedVault)
├── app.html                         # Root HTML shell + Google Fonts (Sora, JetBrains Mono)
├── hooks.server.ts                  # Cookie selected_vault → locals (v1.1)
├── lib/
│   ├── assets/favicon.svg           # Svelte logo favicon
│   └── server/
│       └── keyvault.ts              # ★ KeyVaultClient class + management API (v1.1)
└── routes/
    ├── +layout.svelte               # App shell: dark header + vault selector + sidebar
    ├── +layout.server.ts            # Loads vaults list + selectedVault
    ├── +error.svelte                # Error page
    ├── +page.server.ts              # Root → 302 redirect to /secrets
    ├── api/select-vault/            # POST — set cookie + redirect (v1.1)
    ├── secrets/
    │   ├── +page.server.ts          # List secrets (load) + create/delete (actions)
    │   ├── +page.svelte             # Stats cards + secrets table + inline create form
    │   └── [name]/
    │       ├── +page.server.ts      # Single secret detail (load) + delete (action)
    │       └── +page.svelte         # Detail cards: id, value (reveal/copy), metadata, delete
    ├── keys/
    │   ├── +page.server.ts          # List keys (load)
    │   └── +page.svelte             # Stats cards + keys table (read-only)
    ├── certificates/
    │   ├── +page.server.ts          # List certificates (load)
    │   └── +page.svelte             # Stats cards + certificates table (read-only)
    └── vaults/                      # (v1.1) Multi-vault management
        ├── +page.server.ts          # Load vaults + create/delete (actions)
        ├── +page.svelte             # Vaults table + inline create + export/delete
        ├── import/
        │   ├── +page.server.ts      # Import vault (action)
        │   └── +page.svelte         # File upload + JSON preview + import
        └── [name]/export/
            └── +server.ts           # Proxy vault export as JSON download
```

---

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

---

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

**Scope** is dynamically constructed from `KEYVAULT_EMULATOR_URL` by extracting the `host:port` portion.

---

### UI Routes

| Route | Description |
|---|---|
| `/` | Redirects to `/secrets` |
| `/secrets` | List all secrets with stats cards (total/enabled/disabled), inline create form, inline delete per row |
| `/secrets/[name]` | Secret detail: full ID, value with reveal/hide toggle + copy-to-clipboard, content type, metadata grid, danger zone delete card |
| `/keys` | List all keys with stats cards, read-only table |
| `/certificates` | List all certificates with stats cards, read-only table |
| `/vaults` | (v1.1) Vault CRUD: list, create, delete, export. Stats card showing total vaults |
| `/vaults/import` | (v1.1) Upload JSON export file with preview and import |
| `/vaults/[name]/export` | (v1.1) Download vault as JSON |
| `/api/select-vault` | (v1.1) POST — sets `selected_vault` cookie and redirects |

Layout (`+layout.svelte`):
- **Dark sidebar**: app brand ("kvemu — {title}"), nav items with SVG icons (Secrets, Keys, Certificates), active state with teal accent glow, Manage Vaults link in footer
- **Slim topbar**: "local" badge + vault selector dropdown (persisted via cookie) 
- **Dark theme**: "Secure Console" — deep near-black backgrounds, teal accent, Sora + JetBrains Mono typography

---

### Docker

#### Dockerfile

Multi-stage build:

1. **Build stage** (`node:22-alpine`): `npm ci` → `npm run build`
2. **Runtime stage** (`node:22-alpine`): copies `build/`, `package.json`, `node_modules`. Exposes port 3000. Entrypoint: `node build`.

#### docker-compose.yml

Two services in a shared network:

```yaml
services:
  kvemu:
    build:
      context: ../backend
      dockerfile: deploy/Dockerfile
    ports:
      - "13000:13000"
    environment:
      KV_ADDR:         "0.0.0.0:13000"
      KV_VAULT_HOST:   "kvemu:13000"
      KV_TENANT_ID:    "a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f"
      KV_TLS_AUTO:     "true"
      KV_AUTH_STRICT:  "false"
    volumes:
      - kvemu-data:/data
      - kvemu-certs:/certs

  kv-interface:
    build: .
    ports:
      - "3000:3000"
    environment:
      KEYVAULT_EMULATOR_URL: "https://kvemu:13000"
      KEYVAULT_TENANT_ID:    "a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f"
      KEYVAULT_TITLE:        "One Keyvault"
    depends_on:
      kvemu:
        condition: service_healthy
```

---

### Visual Theme

Dark "Secure Console" design system via CSS custom properties in `app.css`:

| Variable | Value | Usage |
|---|---|---|
| `--accent` | `#2dd4bf` | Primary actions, active states, links. Teal glow on hover |
| `--bg-root` | `#09090b` | Page background (near-black) |
| `--bg-surface` | `#111115` | Cards, sidebar, header |
| `--bg-elevated` | `#18181e` | Hover states, elevated surfaces |
| `--border-default` | `#22222a` | Borders, dividers |
| `--text-primary` | `#e8e8ed` | Headings, body text |
| `--text-secondary` | `#9a9aa8` | Secondary text |
| `--text-muted` | `#60607a` | Placeholders, muted info |
| `--success` | `#4ade80` | Enabled badges, success messages |
| `--warning` | `#fbbf24` | Expiration dates, warnings |
| `--danger` | `#f87171` | Delete actions, disabled badges, danger zones |

**Typography:** Sora (UI) + JetBrains Mono (code, IDs, stat values). Imported via Google Fonts.

**Component classes:** `.btn` (primary/secondary/ghost/danger), `.card`, `.input`, `.badge`, `.stat-card`, `.table-container`, `.empty-state`, `.nav-item` — all defined in `app.css`.

---

### Build & Development

```bash
npm install              # Install dependencies
npm run dev              # Dev server with hot reload (Vite)
npm run dev -- --open    # Dev server + open browser

npm run check            # Type-check (svelte-check)
npm run build            # Production build (adapter-node)
npm run preview          # Preview production build locally

docker compose up --build   # Full stack (kvemu + UI)
```

---

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

### Key Features

- **Dark "Secure Console" theme** — refined near-black palette with teal accent, inspired by security operations tools
- **Multi-vault management** (v1.1) — create, list, delete, export, and import vaults via management API
- **Vault selector** — switch active vault from the topbar, persisted via cookie
- **Stats cards** — at-a-glance metrics (total/enabled/disabled) on every resource page
- **Copy to clipboard** — one-click copy for secret values on the detail page
- **Reveal/Hide toggle** — mask secret values with eye icon toggle
- **Danger zone cards** — destructive actions visually isolated with red borders
- **Server-side rendering** — SvelteKit server-side loads for fast initial page loads
- **Form actions** — progressive enhancement via SvelteKit `enhance()` (works without JavaScript)
- **OAuth2 authentication** — standard client_credentials flow against kvemu's fake AAD, token shared across vaults
- **Token caching** — JWT cached in memory with automatic refresh on 401/403
- **TLS tolerance** — accepts self-signed certificates (development only)
- **Docker Compose** — full stack in a single `docker compose up --build`

---

<a id="português"></a>
## 🇧🇷 Português

### Sobre

**kv-interface** é o painel web do [**kvemu**](../backend) — um emulador do Azure Key Vault que implementa a API data-plane 7.4. Fornece uma interface no navegador para visualizar, criar e remover **Secrets**, e listar **Keys** e **Certificates** armazenados no emulador.

**Stack:** SvelteKit 2 (Svelte 5 runes) · TypeScript 6 · Tailwind CSS 4 · Vite 8 · adapter-node · undici · tema Dark Secure Console

---

### Início Rápido (Docker)

Com Docker instalado, suba o emulador e a interface juntos:

```bash
docker compose up --build
```

Isso inicia dois serviços (veja [`docker-compose.yml`](./docker-compose.yml)):

- **`kvemu`** — build do `../backend`, exposto em `https://localhost:13000`, com TLS auto-gerado, armazenamento SQLite persistente e provedor de identidade AAD fake.
- **`kv-interface`** — esta interface, exposta em `http://localhost:3000`, configurada para encontrar o emulador em `https://kvemu:13000` (resolvido pela rede interna do Compose).

Acesse a interface em **http://localhost:3000**.

---

### Início Rápido (Desenvolvimento Local)

Para desenvolvimento local, rode o frontend diretamente (o emulador kvemu precisa estar rodando):

```bash
cp .env.example .env          # edite KEYVAULT_EMULATOR_URL e KEYVAULT_TENANT_ID se necessário
npm install
npm run dev -- --open
```

Certifique-se de que o kvemu está rodando (ex: `make run` no diretório backend). O `.env.example` aponta para `https://localhost:13000` por padrão.

---

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `KEYVAULT_EMULATOR_URL` | `https://localhost:13000` | URL base do emulador kvemu |
| `KEYVAULT_TENANT_ID` | `a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f` | ID do tenant AAD para o endpoint de token OAuth2 |
| `KEYVAULT_TITLE` | `One Keyvault` | Título exibido no cabeçalho |
| `KEYVAULT_BASE_DOMAIN` | `kvemu.local` | Domínio base para subdomínios de vaults |
| `KEYVAULT_DEFAULT_VAULT` | `vault` | Nome do vault padrão |
| `PORT` | `3000` | Porta de escuta do servidor SvelteKit |
| `ORIGIN` | `http://localhost:3000` | Origem pública para validação de formulários / CSRF |

> A validação do certificado TLS é desabilitada (`rejectUnauthorized: false`) ao falar com o emulador — o kvemu usa certificados autoassinados para desenvolvimento local. **Nunca aponte esta interface para um Key Vault Azure real em produção.**

---

### Arquitetura

```
┌──────────────────────┐        HTTPS (TLS autoassinado)        ┌────────────────────────────┐
│   kv-interface        │ ──────────────────────────────────▶ │   kvemu                     │
│   (SvelteKit / Node)  │   OAuth2 client_credentials          │   (Go / chi / SQLite)       │
│   porta 3000          │   api-version=7.4                    │   porta 13000 (REST API 7.4)│
└──────────────────────┘                                      └────────────────────────────┘
```

```
src/
├── app.css                          # Tailwind 4 + design system dark Secure Console
├── app.d.ts                         # Declarações de tipo (Locals.selectedVault)
├── app.html                         # Shell HTML raiz + Google Fonts
├── hooks.server.ts                  # Cookie selected_vault → event.locals (v1.1)
├── lib/
│   ├── assets/favicon.svg           # Favicon (logo Svelte)
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

---

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

---

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

**Scope** é construído dinamicamente a partir de `KEYVAULT_EMULATOR_URL` extraindo a porção `host:port`.

---

### Rotas da UI

| Rota | Descrição |
|---|---|
| `/` | Redireciona para `/secrets` |
| `/secrets` | Stats cards + tabela (nome, status, atualização, expiração). Formulário inline de criação. Botão deletar inline por linha. |
| `/secrets/[name]` | Detalhe do secret: ID completo, valor com toggle mostrar/ocultar + copiar, metadados, zona de perigo para deletar. |
| `/keys` | Stats cards + tabela (nome, status, atualização, expiração). Somente leitura. |
| `/certificates` | Stats cards + tabela (nome, status, atualização, expiração). Somente leitura. |
| `/vaults` | Gestão de vaults: criar, listar, deletar, exportar, importar (v1.1) |
| `/vaults/import` | Upload de JSON para importar vault com preview e resultado detalhado (v1.1) |
| `/vaults/[name]/export` | Download do vault como JSON (v1.1) |
| `/api/select-vault` | POST — seta cookie `selected_vault` e redireciona (v1.1) |

Layout (`+layout.svelte`):
- Sidebar lateral com ícones SVG: Secrets, Keys, Certificates (rota ativa com glow teal)
- Topbar slim com badge "local" verde e seletor de vault
- Link "Manage Vaults" no rodapé da sidebar

---

### Docker

#### Dockerfile

Build multi-stage:

1. **Estágio de build** (`node:22-alpine`): `npm ci` → `npm run build`
2. **Estágio de runtime** (`node:22-alpine`): copia `build/`, `package.json`, `node_modules`. Expõe porta 3000. Entrypoint: `node build`.

#### docker-compose.yml

Dois serviços em rede compartilhada:

```yaml
services:
  kvemu:
    build:
      context: ../backend
      dockerfile: deploy/Dockerfile
    ports:
      - "13000:13000"
    environment:
      KV_ADDR:         "0.0.0.0:13000"
      KV_VAULT_HOST:   "kvemu:13000"
      KV_TENANT_ID:    "a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f"
      KV_TLS_AUTO:     "true"
      KV_AUTH_STRICT:  "false"
    volumes:
      - kvemu-data:/data
      - kvemu-certs:/certs

  kv-interface:
    build: .
    ports:
      - "3000:3000"
    environment:
      KEYVAULT_EMULATOR_URL: "https://kvemu:13000"
      KEYVAULT_TENANT_ID:    "a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f"
      KEYVAULT_TITLE:        "One Keyvault"
    depends_on:
      kvemu:
        condition: service_healthy
```

---

### Tema Visual

Design system dark "Secure Console" via variáveis CSS no `app.css`:

| Variável | Valor | Uso |
|---|---|---|
| `--accent` | `#2dd4bf` | Ações primárias, links, estados ativos. Glow teal no hover |
| `--bg-root` | `#09090b` | Fundo da página (near-black) |
| `--bg-surface` | `#111115` | Cards, sidebar, header |
| `--bg-elevated` | `#18181e` | Estados de hover, superfícies elevadas |
| `--border-default` | `#22222a` | Bordas, divisores |
| `--text-primary` | `#e8e8ed` | Títulos, corpo de texto |
| `--text-secondary` | `#9a9aa8` | Texto secundário |
| `--text-muted` | `#60607a` | Placeholders, informações menos relevantes |
| `--success` | `#4ade80` | Badges enabled, mensagens de sucesso |
| `--warning` | `#fbbf24` | Datas de expiração, avisos |
| `--danger` | `#f87171` | Ações de deletar, badges disabled, zonas de perigo |

**Tipografia:** Sora (UI) + JetBrains Mono (código, IDs, valores estatísticos). Importadas via Google Fonts.

**Classes de componentes:** `.btn` (primary/secondary/ghost/danger), `.card`, `.input`, `.badge`, `.stat-card`, `.table-container`, `.empty-state`, `.nav-item` — todas definidas em `app.css`.

---

### Build e Desenvolvimento

```bash
npm install              # Instalar dependências
npm run dev              # Servidor de desenvolvimento com hot reload (Vite)
npm run dev -- --open    # Dev server + abrir navegador

npm run check            # Type-check (svelte-check)
npm run build            # Build de produção (adapter-node)
npm run preview          # Previsualizar build de produção localmente

docker compose up --build   # Stack completo (kvemu + interface)
```

---

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

---

### Funcionalidades Principais

- **Tema dark "Secure Console"** — paleta near-black refinada com acento teal, inspirada em ferramentas de operações de segurança
- **Gestão multi-vault** (v1.1) — criar, listar, deletar, exportar e importar vaults via API de gestão
- **Seletor de vault** — alternar vault ativo pela topbar, persistido via cookie
- **Stats cards** — métricas rápidas (total/enabled/disabled) em cada página de recursos
- **Copiar para clipboard** — cópia em um clique para valores de secrets na página de detalhe
- **Toggle mostrar/ocultar** — mascarar valores de secrets com ícone de olho
- **Zonas de perigo** — ações destrutivas isoladas visualmente com bordas vermelhas
- **Renderização server-side** — carregamentos server-side do SvelteKit para carregamento inicial rápido
- **Form actions** — progressive enhancement via `enhance()` do SvelteKit (funciona sem JavaScript)
- **Autenticação OAuth2** — fluxo client_credentials padrão contra o AAD fake do kvemu, token compartilhado entre vaults
- **Cache de token** — JWT cacheado em memória com refresh automático em 401/403
- **Tolerância TLS** — aceita certificados autoassinados (apenas desenvolvimento)
- **Docker Compose** — stack completo em um único `docker compose up --build`
