# kv-interface — Contexto do Frontend

## Resolvido (2026-06-11)

- [x] **CSRF / troca de vault em produção** — `csrf.checkOrigin = false` no `svelte.config.js`. Ferramenta interna self-hosted acessada por múltiplos hostnames (lab-dilson, FQDN Tailscale, IP).
- [x] **`onVaultChange` não checa `response.ok`** — agora exibe erro i18n (`bar.vault_change_error`) em banner abaixo do header quando `fetch('/api/select-vault')` falha.
- [x] **Commit + push** do frontend (branch `feature/v1.1-multi-vault`).

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
│   │       └── keyvault.ts           # KeyVaultClient (plano /ui) + getVaultClient()
│   └── routes/
│       ├── +layout.svelte            # Shell: sidebar + vault selector + lang switcher
│       ├── +layout.server.ts         # Load vaults list + selectedVault + lang
│       ├── +error.svelte             # Error page (i18n)
│       ├── +page.server.ts           # Root → redirect /secrets
│       ├── ca/                       # GET — serve CA certificate download
│       ├── api/select-vault/         # POST — set cookie selected_vault, responde 204
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

A UI **não autentica** contra o AAD fake. Ela consome o plano `/ui` do kvemu, que
é sem AAD (igual ao management plane) — o `KeyVaultClient` faz chamadas server-side
diretas, sem Bearer/token. O AAD fake (`/{tenant}/oauth2/...`) continua existindo no
emulador, mas só para os **SDKs Azure reais** que falam a data-plane 7.4 via `Host`.

### Detalhes de implementação

- TLS: `rejectUnauthorized: false` (kvemu usa certificado autoassinado)
- Vault explícito no path: `${KEYVAULT_EMULATOR_URL}/ui/vaults/{vault}/...`
- Todas as chamadas são server-side (adapter-node), nunca expostas ao browser

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
| `KEYVAULT_BASE_DOMAIN` | Domínio base exibido no Setup Guide (`/vaults`) p/ SDKs Azure. Não é mais usado p/ rotear o KeyVaultClient (que usa o plano `/ui`) | `kvemu.local` |
| `KEYVAULT_DEFAULT_VAULT` | Nome do vault padrão | `vault` |
| `KV_CA_FILE` | Caminho do CA p/ download | `/certs/ca.pem` |
| `PORT` | Porta do servidor SvelteKit | `3000` |
| `ORIGIN` | Origin header (CSRF) | `http://localhost:3000` |

---

## Endpoints da API (kvemu)

A UI consome o **plano `/ui`** do kvemu (fora da spec Azure): vault explícito no
path, **sem Bearer/token, sem subdomínio**. O backend resolve o vault pelo path
(`VaultFromPath`) e filtra os dados — roteamento determinístico, sem depender de
DNS. A data-plane Azure 7.4 (Host-based) é usada só pelos SDKs reais, não pela UI.

### Secrets
| Método | Path | Função |
|--------|------|--------|
| GET | `/ui/vaults/{vault}/secrets` | `listSecrets()` |
| GET | `/ui/vaults/{vault}/secrets/{name}` | `getSecret(name)` |
| PUT | `/ui/vaults/{vault}/secrets/{name}` | `setSecret(name, value)` |
| DELETE | `/ui/vaults/{vault}/secrets/{name}` | `deleteSecret(name)` |

### Keys
| Método | Path | Função |
|--------|------|--------|
| GET | `/ui/vaults/{vault}/keys` | `listKeys()` |

### Certificates
| Método | Path | Função |
|--------|------|--------|
| GET | `/ui/vaults/{vault}/certificates` | `listCertificates()` |

> `{vault}` vem de `locals.selectedVault`. A gestão de vaults (`/vaults`) e o
> download da CA (`/ca`) continuam nos seus endpoints próprios.

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
| `/api/select-vault` | POST — seta cookie `selected_vault`, responde 204 (cliente faz `invalidateAll`) |

### Layout (`+layout.svelte`)

- **Tema:** Dark "Secure Console" (fundo #09090b, accent teal #2dd4bf)
- **Sidebar:** Logo kvemu, nav items i18n (Objects, Secrets, Keys, Certificates, Integrations), footer "Manage Vaults"
- **Top bar:** Badge "local", vault selector dropdown, language switcher (EN/PT/ES)
- **Vault selector:** `<select>` com `value={data.selectedVault}` + `onchange` que faz `fetch` POST p/ `/api/select-vault` (204) e então `invalidateAll()` — troca client-side suave

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
- `onchange` faz `fetch` p/ `/api/select-vault` (seta o cookie) + `invalidateAll()` — troca client-side suave, sem reload cheio. Select desabilita enquanto carrega
- Barra de progresso indeterminada + fade no conteúdo em navegação/troca de vault (store `navigating` + flag `switchingVault`)
- Cookie `selected_vault` persiste seleção

### KeyVaultClient (`lib/server/keyvault.ts`)
- `getVaultClient(vaultName?)` — retorna `new KeyVaultClient(...)`; sem argumento usa `KEYVAULT_DEFAULT_VAULT`
- `request()` fala o plano `/ui`: `${emulatorUrl}/ui/vaults/{vaultName}/...` — **sem token AAD, sem subdomínio**
- `mgmtRequest()` usa `emulatorUrl()` diretamente para a gestão de vaults (`/vaults`)
- Sem singleton/cache de token (removidos): roteamento por vault é determinístico pelo path

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
| `src/routes/api/select-vault/+server.ts` | Seta cookie selected_vault, responde 204 |
