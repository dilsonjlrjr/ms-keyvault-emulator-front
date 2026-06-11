# kv-interface — Contexto do Frontend

## Visão Geral

**kv-interface** é o painel web SPA do **kvemu** (emulador Azure Key Vault), construído com SvelteKit 2. Fornece UI para gerenciar secrets, keys e certificates armazenados no emulador, com suporte a múltiplos vaults (v1.1).

**Stack:** SvelteKit 2 (Svelte 5, runes mode), TypeScript 6, Tailwind CSS 4, Vite 8, adapter-node, undici (HTTP client), i18n (en/pt/es).

**Modo:** SPA puro (`ssr = false`). Toda renderização é client-side. Dados via AJAX para proxies server-side que encaminham ao kvemu.

---

## Arquitetura

```
frontend/
├── src/
│   ├── app.d.ts                      # Types globais
│   ├── app.html                      # Root HTML shell
│   ├── app.css                       # Global CSS + Tailwind + Dark "Secure Console" theme
│   ├── lib/
│   │   ├── i18n.ts                   # Dicionário de traduções en/pt/es + função t()
│   │   ├── version.ts                # Versão (PUBLIC_APP_VERSION do .env)
│   │   ├── IntegrationsGuide.svelte  # Componente compartilhado: guia de integração
│   │   ├── assets/favicon.svg        # Favicon
│   │   └── server/
│   │       └── keyvault.ts           # KeyVaultClient (plano /ui) + getVaultClient()
│   └── routes/
│       ├── +layout.svelte            # Shell: sidebar + vault selector + lang switcher + versão
│       ├── +layout.ts                # SPA load: vaults via /api/mgmt, selectedVault + lang do localStorage
│       ├── +error.svelte             # Error page (i18n)
│       ├── +page.ts                  # Root → redirect /secrets
│       ├── ca/                       # GET — serve CA certificate download
│       ├── api/
│       │   ├── mgmt/[...path]/       # Proxy management (GET/POST/DELETE → kvemu /vaults, /vaults/import)
│       │   └── vault/[vault]/kv/[...path]/  # Proxy data-plane (GET → kvemu /ui/vaults/{vault}/...)
│       ├── secrets/                  # List (AJAX) + create/delete (form action)
│       │   └── [name]/              # Detail (AJAX) + reveal + delete (form action)
│       ├── keys/                     # List (AJAX, read-only, i18n)
│       ├── certificates/             # List (AJAX, read-only, i18n)
│       ├── vaults/                   # CRUD + setup guide com IntegrationsGuide (i18n)
│       │   └── import/              # Upload JSON para importar vault (i18n)
│       └── integrations/             # Guia de integração (Spring Boot + Go)
├── static/robots.txt
├── Dockerfile                        # Multi-stage (node:22-alpine)
├── docker-compose.yml                # kvemu + kv-interface
├── .env                              # PUBLIC_APP_VERSION (git SHA)
├── README.md
└── CONTEXT.md
```

---

## Modo SPA

`ssr = false` no `+layout.ts`. O servidor envia shell HTML vazio; toda renderização é client-side. Os `+page.ts` (universal load) buscam dados via `fetch()` aos proxies `/api/vault/{vault}/kv/...` e `/api/mgmt/...`.

---

## Seleção de Vault (localStorage)

**Sem cookies, sem `/api/select-vault`.** O vault selecionado fica em `localStorage`:

1. `<select>` no header — `onchange` → `localStorage.setItem('selected_vault', vault)` + `invalidateAll()`
2. `+layout.ts` lê `localStorage.getItem('selected_vault')` (fallback `'vault'` no server)
3. `+page.ts` usa `parent()` para obter `selectedVault` do layout
4. Form actions (create/delete) recebem `vault` via `<input type="hidden" name="vault">`

O idioma também usa `localStorage` (`lang`).

---

## Proxies da API

### Data-plane — `/api/vault/{vault}/kv/[...path]`

Vault explícito na URL. Encaminha para `kvemu /ui/vaults/{vault}/...`. Sem AAD, sem token.

| Método | Path | kvemu destino |
|--------|------|---------------|
| GET | `/api/vault/{vault}/kv/secrets` | `GET /ui/vaults/{vault}/secrets` |
| GET | `/api/vault/{vault}/kv/secrets/{name}` | `GET /ui/vaults/{vault}/secrets/{name}` |
| GET | `/api/vault/{vault}/kv/keys` | `GET /ui/vaults/{vault}/keys` |
| GET | `/api/vault/{vault}/kv/certificates` | `GET /ui/vaults/{vault}/certificates` |

### Management — `/api/mgmt/[...path]`

Encaminha direto para `kvemu /vaults`, `/vaults/import`, etc.

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/api/mgmt/vaults` | Lista vaults |
| POST | `/api/mgmt/vaults` | Cria vault |
| GET | `/api/mgmt/vaults/{name}` | Detalhes do vault |
| DELETE | `/api/mgmt/vaults/{name}` | Deleta vault |
| GET | `/api/mgmt/vaults/{name}/export` | Exporta vault |
| POST | `/api/mgmt/vaults/import` | Importa vault |

---

## Fluxo de Autenticação

A UI **não autentica** contra o AAD fake. Os proxies (`+server.ts`) fazem chamadas server-side ao kvemu com `rejectUnauthorized: false`. O browser nunca vê o kvemu diretamente.

---

## Internacionalização (i18n)

Suporte a **Inglês, Português e Espanhol** (en/pt/es).

1. `+layout.ts` lê `localStorage.getItem('lang')` (fallback `'en'`)
2. `+layout.svelte` expõe botões EN/PT/ES no header que setam `localStorage` + recarregam
3. Todos os componentes usam `page.data.lang` do `$app/state`
4. Função helper `_ = (key) => t(key, page.data.lang)` resolve traduções de `$lib/i18n.ts`

---

## Estilo Visual

Dark "Secure Console" theme com CSS custom properties em `app.css`:

| Token | Valor |
|-------|-------|
| `--bg-root` | `#09090b` |
| `--bg-surface` | `#111115` |
| `--bg-elevated` | `#18181e` |
| `--bg-input` | `#0e0e12` |
| `--border-default` | `#22222a` |
| `--text-primary` | `#e8e8ed` |
| `--text-secondary` | `#9a9aa8` |
| `--text-muted` | `#60607a` |
| `--accent` | `#2dd4bf` (teal) |
| `--success` | `#4ade80` |
| `--danger` | `#f87171` |
| `--warning` | `#fbbf24` |

---

## Variáveis de Ambiente

| Var | Descrição | Default |
|-----|-----------|---------|
| `KEYVAULT_EMULATOR_URL` | URL base do kvemu | `https://localhost:13000` |
| `KEYVAULT_TENANT_ID` | Tenant ID p/ OAuth2 | `a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f` |
| `KEYVAULT_TITLE` | Título no header | `One Keyvault` |
| `KEYVAULT_DEFAULT_VAULT` | Nome do vault padrão | `vault` |
| `KV_CA_FILE` | Caminho do CA p/ download | `/certs/ca.pem` |
| `PORT` | Porta do servidor SvelteKit | `3000` |
| `ORIGIN` | Origin header (CSRF) | `http://localhost:3000` |
| `PUBLIC_APP_VERSION` | Versão exibida no sidebar (git SHA) | — |

---

## Rotas da UI

| Rota | Descrição |
|------|-----------|
| `/` | Redirect 302 → `/secrets` |
| `/secrets` | Lista secrets + form inline create/delete |
| `/secrets/[name]` | Detalhe: reveal value, metadata, danger zone |
| `/keys` | Lista keys (read-only) |
| `/certificates` | Lista certificates (read-only) |
| `/vaults` | Gestão de vaults: criar, listar, deletar, exportar; Setup Guide após criação |
| `/vaults/import` | Upload JSON p/ importar vault com preview |
| `/vaults/[name]/export` | Download do vault como JSON |
| `/integrations` | Guia completo de integração Spring Boot + Go |
| `/ca` | Download do certificado CA (GET → PEM file) |

### Layout (`+layout.svelte`)

- **Tema:** Dark "Secure Console"
- **Sidebar:** Logo kvemu, nav items i18n, footer "Manage Vaults", versão `v{sha}`
- **Top bar:** Badge "local", vault selector dropdown, language switcher (EN/PT/ES)
- **Vault selector:** `<select>` com `localStorage` + `invalidateAll()` — sem cookies

---

## Docker

### Dockerfile
Multi-stage build:
1. `node:22-alpine` → `npm ci` + `npm run build`
2. `node:22-alpine` → copia `build/`, `package.json`, `node_modules`
3. Expõe porta 3000, entrypoint `node build`

### docker-compose.yml
Dois serviços:
- **kvemu**: build do `../backend`, porta 13000, TLS auto, volumes p/ data + certs, healthcheck `/healthz`
- **kv-interface**: build local, porta 3000, depende de `kvemu` healthy, mount `kvemu-certs:/certs:ro` p/ CA download

---

## Comandos

```bash
npm run dev          # Dev server (Vite)
npm run build        # Build produção → build/
npm run preview      # Preview do build
npm run check        # Type-check (svelte-check)
```

---

## Versão

O git SHA do commit é injetado via `.env` (`PUBLIC_APP_VERSION`) e exibido no sidebar footer como `v{sha}`. Atualizar `.env` antes do deploy:

```bash
echo "PUBLIC_APP_VERSION=$(git rev-parse --short HEAD)" > .env
```
