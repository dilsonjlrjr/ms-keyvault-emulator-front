# kv-interface — Contexto do Frontend

## Visão Geral

**kv-interface** é o painel web do **kvemu** (emulador Azure Key Vault), construído com SvelteKit 2. Fornece UI para gerenciar secrets, keys e certificates armazenados no emulador, com suporte a múltiplos vaults (v1.1).

**Stack:** SvelteKit 2 (Svelte 5, runes mode), TypeScript 6, Tailwind CSS 4, Vite 8, adapter-node, undici (HTTP client), i18n (en/pt/es).

---

## Arquitetura

```
frontend/
├── src/
│   ├── app.d.ts                      # Locals: selectedVault, lang
│   ├── app.html                      # Root HTML shell
│   ├── app.css                       # Global CSS + Tailwind + Dark "Secure Console" theme
│   ├── hooks.server.ts               # Cookie: selectedVault + lang → locals
│   ├── lib/
│   │   ├── index.ts                  # Barrel (vazio)
│   │   ├── i18n.ts                   # Dicionário de traduções en/pt/es + função t()
│   │   ├── IntegrationsGuide.svelte  # Componente compartilhado: guia de integração
│   │   ├── assets/favicon.svg        # Favicon
│   │   └── server/
│   │       └── keyvault.ts           # KeyVaultClient class + singleton getVaultClient()
│   └── routes/
│       ├── +layout.svelte            # Shell: sidebar + vault selector + lang switcher
│       ├── +layout.server.ts         # Load vaults list + selectedVault + lang
│       ├── +error.svelte             # Error page (i18n)
│       ├── +page.server.ts           # Root → redirect /secrets
│       ├── ca/                       # GET — serve CA certificate download
│       ├── api/select-vault/         # POST — set cookie selected_vault + redirect
│       ├── secrets/                  # List + create/delete (i18n)
│       │   └── [name]/              # Detail + reveal + delete (i18n)
│       ├── keys/                     # List (read-only, i18n)
│       ├── certificates/             # List (read-only, i18n)
│       ├── vaults/                   # CRUD + setup guide com IntegrationsGuide (i18n)
│       │   └── import/              # Upload JSON para importar vault (i18n)
│       └── integrations/             # Guia de integração (Spring Boot + Go)
├── static/robots.txt
├── Dockerfile                        # Multi-stage (node:22-alpine)
├── docker-compose.yml                # kvemu + kv-interface
├── README.md
└── CONTEXT.md
```

---

## Fluxo de Autenticação

O frontend autentica contra o AAD fake do kvemu via OAuth2 `client_credentials`:

1. `POST /{tenant}/oauth2/v2.0/token` com body form-encoded:
   ```
   grant_type=client_credentials
   client_id=kv-interface
   client_secret=kv-interface-secret
   scope=https://{host}/.default
   ```
2. Response JSON: `{ "access_token": "...", "expires_in": 3600, "token_type": "Bearer" }`
3. Token cacheado em memória (80% do `expires_in`, máx 25min)
4. Bearer token enviado em todas as chamadas data-plane
5. Retry automático em 401/403: limpa cache, obtém token fresco, retenta 1x

### Detalhes de implementação

- TLS: `rejectUnauthorized: false` (kvemu usa certificado autoassinado)
- `api-version=7.4` em todas as chamadas data-plane
- Scope construído extraindo `host:port` da `KEYVAULT_EMULATOR_URL`

---

## Internacionalização (i18n)

Suporte completo a **Inglês, Português e Espanhol** (en/pt/es).

### Fluxo de linguagem

1. `hooks.server.ts` lê cookie `lang` → `event.locals.lang`
2. `+layout.server.ts` retorna `lang: locals.lang || 'en'`
3. `+layout.svelte` expõe botões EN/PT/ES no header que setam cookie + recarregam a página
4. Todos os componentes usam `page.data.lang` do `$app/state` para obter o idioma atual
5. Função helper `_ = (key) => t(key, page.data.lang)` resolve traduções do dicionário em `$lib/i18n.ts`

### Dicionário de traduções (`$lib/i18n.ts`)

Arquivo central com ~100 chaves de tradução organizadas por domínio:
- `nav.*` — navegação lateral
- `bar.*` — barra superior
- `secrets.*` — página de secrets (lista, criação, detalhe)
- `keys.*` — página de keys
- `certs.*` — página de certificates
- `vaults.*` — página de vaults (criação, setup guide, import, tabela)
- `integrations.*` — guia de integração (títulos, descrições)
- `error.*` — página de erro
- `common.*` — strings compartilhadas (Enabled, Disabled, Delete, Cancel, etc.)

### Componente `IntegrationsGuide`

- **Arquivo:** `$lib/IntegrationsGuide.svelte`
- **Uso:** Compartilhado entre `/integrations` e o Setup Guide após criar vault em `/vaults`
- **Conteúdo:** Guia completo de integração com:
  1. "Local Machine Setup" — download CA, /etc/hosts, JAVA_TOOL_OPTIONS
  2. Spring Boot — configuration, secrets no código, CA import, Docker Compose
  3. Go — HTTP client, set/encrypt/decrypt/list secrets
  4. Tabela de variáveis de ambiente do kvemu
  5. Tabela de compatibilidade (Spring Boot 2.7.9/2.7.18/3.4.5)
- Usa `page.data.lang` para textos descritivos
- Code snippets em inglês (padrão para código)
- Tabs Spring Boot / Go

---

## Variáveis de Ambiente

| Var | Descrição | Default |
|-----|-----------|---------|
| `KEYVAULT_EMULATOR_URL` | URL base do kvemu | `https://localhost:13000` |
| `KEYVAULT_TENANT_ID` | Tenant ID p/ OAuth2 | `a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f` |
| `KEYVAULT_TITLE` | Título no header | `One Keyvault` |
| `KEYVAULT_BASE_DOMAIN` | Domínio base p/ multi-vault | `kvemu.local` |
| `KEYVAULT_DEFAULT_VAULT` | Nome do vault padrão | `vault` |
| `KV_CA_FILE` | Caminho do CA p/ download | `/certs/ca.pem` |
| `PORT` | Porta do servidor SvelteKit | `3000` |
| `ORIGIN` | Origin header (CSRF) | `http://localhost:3000` |

---

## Endpoints da API (kvemu)

### Auth (público, sem Bearer)
| Método | Path | Uso |
|--------|------|-----|
| POST | `/{tenant}/oauth2/v2.0/token` | Obter JWT (client_credentials) |

### Secrets
| Método | Path | Função |
|--------|------|--------|
| GET | `/secrets?api-version=7.4` | `listSecrets()` |
| GET | `/secrets/{name}?api-version=7.4` | `getSecret(name)` |
| PUT | `/secrets/{name}?api-version=7.4` | `setSecret(name, value)` |
| DELETE | `/secrets/{name}?api-version=7.4` | `deleteSecret(name)` |

### Keys
| Método | Path | Função |
|--------|------|--------|
| GET | `/keys?api-version=7.4` | `listKeys()` |

### Certificates
| Método | Path | Função |
|--------|------|--------|
| GET | `/certificates?api-version=7.4` | `listCertificates()` |

---

## Tipos de Resposta

### VaultItem (item de lista)
```typescript
{
  id: string;
  attributes?: { enabled?: boolean; created?: number; updated?: number; expires?: number | null };
  tags?: Record<string, string>;
}
```

### SecretBundle (detalhe do secret)
```typescript
extends VaultItem {
  value?: string;
  contentType?: string | null;
}
```

O nome do item é extraído do penúltimo segmento do `id` (ex: `https://host/secrets/my-secret/abc123` → `my-secret`).

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
| `/api/select-vault` | POST — seta cookie `selected_vault` e redireciona |

### Layout (`+layout.svelte`)

- **Tema:** Dark "Secure Console" (fundo #09090b, accent teal #2dd4bf)
- **Sidebar:** Logo kvemu, nav items i18n (Objects, Secrets, Keys, Certificates, Integrations), footer "Manage Vaults"
- **Top bar:** Badge "local", vault selector dropdown, language switcher (EN/PT/ES)
- **Vault selector:** `<select>` com `value={data.selectedVault}` + `onchange` que submete form nativo para `/api/select-vault`
- **Redirect-back:** `/api/select-vault` lê campo `from` do form e redireciona para a página atual (não sempre `/secrets`)

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

Componentes CSS: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-sm`, `.input`, `.badge`, `.card`, `.card-header`, `.card-body`, `.stat-card`, `.table-container`, `.nav-item`, `.nav-icon`, `.empty-state`, `.page-header`, `.page-title`, `.page-subtitle`, `.form-msg`, `.separator`, `.link`

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

### docker-compose (lab-dilson)
- Usa imagens pré-buildadas (`kv-server-kvemu`, `kv-server-kv-interface`)
- `kvemu-init` service com alpine `chown 65532:65532` p/ corrigir permissões de volume
- Network aliases: `kvemu.local`, `vault.kvemu.local`, `login.microsoftonline.com`, `lab-dilson`

---

## Comandos

```bash
npm run dev          # Dev server (Vite)
npm run build        # Build produção → build/
npm run preview      # Preview do build
npm run check        # Type-check (svelte-check)
```

Deploy lab-dilson:
```bash
npm run build
tar czf /tmp/deploy.tar.gz build package.json
scp /tmp/deploy.tar.gz lab-dilson:/home/dilson/containers/keyvault/kv-interface-build/
ssh lab-dilson "cd ... && tar xzf deploy.tar.gz && docker build -t kv-server-kv-interface . && docker compose up -d kv-interface"
```

---

## Relação com kvemu

O frontend é um cliente data-plane puro do kvemu:
- Usa o mesmo fluxo OAuth2 que o SDK Azure (client_credentials)
- Não requer `/token` simplificado — usa os endpoints AAD fake padrão
- TLS autoassinado aceito (dev/local apenas)
- Compatível com qualquer instância kvemu (basta configurar URL + tenant ID)

---

## Multi-Vault (v1.1)

### Vault Selector
- Dropdown no header com `value={data.selectedVault}` (do cookie)
- Form nativo POST p/ `/api/select-vault` com campo `from` p/ redirect-back
- Cookie `selected_vault` persiste seleção

### KeyVaultClient (`lib/server/keyvault.ts`)
- Singleton `getVaultClient(vaultName?)` — sem argumentos usa `KEYVAULT_DEFAULT_VAULT`
- `vaultUrl` constrói `https://{name}.{baseDomain}:{port}`
- `mgmtRequest()` usa `emulatorUrl()` diretamente (sem vault prefix)
- Token OAuth2 cacheado globalmente, compartilhado entre vaults

### Management API (sem AAD auth)
| Método | Path | Uso |
|--------|------|-----|
| GET | `/vaults` | `listVaults()` |
| POST | `/vaults` | `createVault(name, displayName, tenantId)` |
| GET | `/vaults/{name}` | `getVault(name)` |
| DELETE | `/vaults/{name}` | `deleteVault(name)` |
| GET | `/vaults/{name}/export` | `exportVault(name)` |
| POST | `/vaults/import` | `importVault(data)` |

### Hooks
`hooks.server.ts`:
- `event.cookies.get('selected_vault')` → `event.locals.selectedVault`
- `event.cookies.get('lang')` → `event.locals.lang`

### Arquivos novos (v1.1 + features posteriores)
| Arquivo | Descrição |
|---------|-----------|
| `src/hooks.server.ts` | Hook: selectedVault + lang cookies → locals |
| `src/lib/i18n.ts` | Dicionário en/pt/es + função `t()` |
| `src/lib/IntegrationsGuide.svelte` | Guia de integração compartilhado |
| `src/routes/vaults/+page.svelte` | Gestão de vaults + Setup Guide |
| `src/routes/vaults/import/+page.svelte` | Upload JSON p/ importar vault |
| `src/routes/integrations/+page.svelte` | Página de guia de integração |
| `src/routes/ca/+server.ts` | Endpoint download CA certificate |
| `src/routes/api/select-vault/+server.ts` | Cookie selected_vault + redirect |
