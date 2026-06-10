# kv-interface — Key Vault Emulator Web UI

**[🇺🇸 English](#english) · [🇧🇷 Português](#português)**

---

<a id="english"></a>
## 🇺🇸 English

### About

**kv-interface** is the web dashboard for [**kvemu**](../backend) — an Azure Key Vault emulator implementing the data-plane API 7.4. It provides a browser UI to view, create, and delete **Secrets**, and list **Keys** and **Certificates** stored in the emulator.

**Stack:** SvelteKit 2 (Svelte 5 runes) · TypeScript 6 · Tailwind CSS 4 · Vite 8 · adapter-node · undici · Azure Portal visual theme

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
| `KEYVAULT_TITLE` | `One Keyvault` | Title displayed in the header ("Key Vault Emulator — {title}") |
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
├── app.css                          # Tailwind 4 + Azure Portal CSS variables
├── app.d.ts                         # Type declarations
├── app.html                         # Root HTML shell
├── lib/
│   ├── assets/favicon.svg           # Svelte logo favicon
│   └── server/
│       └── keyvault.ts              # ★ Core API client (auth + data-plane calls)
└── routes/
    ├── +layout.svelte               # App shell: header + sidebar nav
    ├── +layout.server.ts            # Loads KEYVAULT_TITLE env var
    ├── +error.svelte                # Error page (shows hints for common issues)
    ├── +page.server.ts              # Root → 302 redirect to /secrets
    ├── secrets/
    │   ├── +page.server.ts          # List secrets (load) + create/delete (actions)
    │   ├── +page.svelte             # Secrets table + inline create form
    │   └── [name]/
    │       ├── +page.server.ts      # Single secret detail (load) + delete (action)
    │       └── +page.svelte         # Secret detail: id, value (show/hide), contentType
    ├── keys/
    │   ├── +page.server.ts          # List keys (load)
    │   └── +page.svelte             # Keys table (read-only)
    └── certificates/
        ├── +page.server.ts          # List certificates (load)
        └── +page.svelte             # Certificates table (read-only)
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
| `/secrets` | List all secrets (table: name, status, updated, expiration). Inline create form. Inline delete per row. |
| `/secrets/[name]` | Secret detail: full ID, value with show/hide toggle, content type, enabled status. Delete button. |
| `/keys` | List all keys (table: name, status, updated, expiration). Read-only. |
| `/certificates` | List all certificates (table: name, status, updated, expiration). Read-only. |

Layout (`+layout.svelte`):
- Dark blue header: "Key Vault Emulator — {title}" + "local" badge
- Sidebar navigation: Secrets, Keys, Certificates (active route highlighted)

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

Styled after the Azure Portal design system via CSS custom properties in `app.css`:

| Variable | Value | Usage |
|---|---|---|
| `--mc-blue` | `#0078d4` | Links, primary buttons |
| `--mc-bg` | `#f5f5f5` | Page background |
| `--mc-surface` | `#ffffff` | Cards, tables |
| `--mc-border` | `#e1e1e1` | Borders, dividers |
| `--mc-text` | `#1b1b1b` | Body text |
| `--mc-text-muted` | `#605e5c` | Secondary text, placeholders |

Font stack: `Segoe UI, system-ui, -apple-system, sans-serif`.

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

- **Azure Portal theme** — familiar look for Azure developers
- **Server-side rendering** — SvelteKit server-side loads for fast initial page loads
- **Form actions** — progressive enhancement via SvelteKit `enhance()` (works without JavaScript)
- **OAuth2 authentication** — standard client_credentials flow against kvemu's fake AAD
- **Token caching** — JWT cached in memory with automatic refresh on 401/403
- **TLS tolerance** — accepts self-signed certificates (development only)
- **Docker Compose** — full stack in a single `docker compose up --build`

---

<a id="português"></a>
## 🇧🇷 Português

### Sobre

**kv-interface** é o painel web do [**kvemu**](../backend) — um emulador do Azure Key Vault que implementa a API data-plane 7.4. Fornece uma interface no navegador para visualizar, criar e remover **Secrets**, e listar **Keys** e **Certificates** armazenados no emulador.

**Stack:** SvelteKit 2 (Svelte 5 runes) · TypeScript 6 · Tailwind CSS 4 · Vite 8 · adapter-node · undici · tema visual Azure Portal

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
| `KEYVAULT_TITLE` | `One Keyvault` | Título exibido no cabeçalho ("Key Vault Emulator — {título}") |
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
├── app.css                          # Tailwind 4 + variáveis CSS Azure Portal
├── app.d.ts                         # Declarações de tipo
├── app.html                         # Shell HTML raiz
├── lib/
│   ├── assets/favicon.svg           # Favicon (logo Svelte)
│   └── server/
│       └── keyvault.ts              # ★ Cliente de API principal (auth + chamadas data-plane)
└── routes/
    ├── +layout.svelte               # Shell da aplicação: cabeçalho + sidebar
    ├── +layout.server.ts            # Carrega a env var KEYVAULT_TITLE
    ├── +error.svelte                # Página de erro (dicas para problemas comuns)
    ├── +page.server.ts              # Raiz → redirect 302 para /secrets
    ├── secrets/
    │   ├── +page.server.ts          # Listar secrets (load) + criar/deletar (actions)
    │   ├── +page.svelte             # Tabela de secrets + formulário inline de criação
    │   └── [name]/
    │       ├── +page.server.ts      # Detalhe do secret (load) + deletar (action)
    │       └── +page.svelte         # Detalhe: id, valor (mostrar/ocultar), contentType
    ├── keys/
    │   ├── +page.server.ts          # Listar keys (load)
    │   └── +page.svelte             # Tabela de keys (somente leitura)
    └── certificates/
        ├── +page.server.ts          # Listar certificates (load)
        └── +page.svelte             # Tabela de certificates (somente leitura)
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
| `/secrets` | Lista todos os secrets (tabela: nome, status, atualização, expiração). Formulário inline de criação. Botão deletar inline por linha. |
| `/secrets/[name]` | Detalhe do secret: ID completo, valor com toggle mostrar/ocultar, content type, status. Botão deletar. |
| `/keys` | Lista todas as keys (tabela: nome, status, atualização, expiração). Somente leitura. |
| `/certificates` | Lista todos os certificates (tabela: nome, status, atualização, expiração). Somente leitura. |

Layout (`+layout.svelte`):
- Cabeçalho azul escuro: "Key Vault Emulator — {título}" + badge "local"
- Navegação lateral: Secrets, Keys, Certificates (rota ativa destacada)

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

Estilo inspirado no Azure Portal via variáveis CSS customizadas no `app.css`:

| Variável | Valor | Uso |
|---|---|---|
| `--mc-blue` | `#0078d4` | Links, botões primários |
| `--mc-bg` | `#f5f5f5` | Fundo da página |
| `--mc-surface` | `#ffffff` | Cards, tabelas |
| `--mc-border` | `#e1e1e1` | Bordas, divisores |
| `--mc-text` | `#1b1b1b` | Texto principal |
| `--mc-text-muted` | `#605e5c` | Texto secundário, placeholders |

Fonte: `Segoe UI, system-ui, -apple-system, sans-serif`.

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

- **Tema Azure Portal** — visual familiar para desenvolvedores Azure
- **Renderização server-side** — carregamentos server-side do SvelteKit para carregamento inicial rápido
- **Form actions** — progressive enhancement via `enhance()` do SvelteKit (funciona sem JavaScript)
- **Autenticação OAuth2** — fluxo client_credentials padrão contra o AAD fake do kvemu
- **Cache de token** — JWT cacheado em memória com refresh automático em 401/403
- **Tolerância TLS** — aceita certificados autoassinados (apenas desenvolvimento)
- **Docker Compose** — stack completo em um único `docker compose up --build`
