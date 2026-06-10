# kv-interface — Contexto do Frontend

## Visão Geral

**kv-interface** é o painel web do **kvemu** (emulador Azure Key Vault), construído com SvelteKit 2. Fornece UI para gerenciar secrets, keys e certificates armazenados no emulador.

**Stack:** SvelteKit 2 (Svelte 5, runes mode), TypeScript 6, Tailwind CSS 4, Vite 8, adapter-node, undici (HTTP client).

---

## Arquitetura

```
frontend/
├── src/
│   ├── app.d.ts                      # Type declarations
│   ├── app.html                      # Root HTML shell
│   ├── app.css                       # Global CSS + Tailwind + Azure Portal theme vars
│   ├── lib/
│   │   ├── index.ts                  # Barrel (vazio)
│   │   ├── assets/favicon.svg        # Favicon
│   │   └── server/
│   │       └── keyvault.ts           # ★ Core API client (OAuth2 + data-plane)
│   └── routes/
│       ├── +layout.svelte            # Shell: header + sidebar nav
│       ├── +layout.server.ts         # Load KEYVAULT_TITLE env var
│       ├── +error.svelte             # Error page
│       ├── +page.server.ts           # Root → redirect /secrets
│       ├── secrets/
│       │   ├── +page.server.ts       # List + create/delete actions
│       │   ├── +page.svelte          # Secrets table + create form
│       │   └── [name]/
│       │       ├── +page.server.ts   # Single secret detail
│       │       └── +page.svelte      # Secret detail (show/hide value)
│       ├── keys/
│       │   ├── +page.server.ts       # List keys
│       │   └── +page.svelte          # Keys table (read-only)
│       └── certificates/
│           ├── +page.server.ts       # List certificates
│           └── +page.svelte          # Certificates table (read-only)
├── static/robots.txt
├── Dockerfile                        # Multi-stage (node:22-alpine)
├── docker-compose.yml                # kvemu + kv-interface
├── .env.example                      # Env vars de referência
└── dist/                             # Pacote de deploy pré-buildado
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

## Variáveis de Ambiente

| Var | Descrição | Default |
|-----|-----------|---------|
| `KEYVAULT_EMULATOR_URL` | URL base do kvemu | `https://localhost:13000` |
| `KEYVAULT_TENANT_ID` | Tenant ID p/ OAuth2 | `a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f` |
| `KEYVAULT_TITLE` | Título no header | `One Keyvault` |
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
  id: string;              // "https://host/secrets/name/version"
  attributes?: {
    enabled?: boolean;
    created?: number;      // epoch seconds
    updated?: number;
    expires?: number | null;
  };
  tags?: Record<string, string>;
}
```

### VaultItemList
```typescript
{
  value: VaultItem[];
  nextLink?: string | null;
}
```

### SecretBundle (detalhe do secret)
```typescript
extends VaultItem {
  value?: string;
  contentType?: string | null;
}
```

O nome do item é extraído do penúltimo segmento do `id` (ex: `https://host/secrets/my-secret/abc123` → `my-secret`). O último segmento é sempre o version GUID.

---

## Rotas da UI

| Rota | Descrição |
|------|-----------|
| `/` | Redirect 302 → `/secrets` |
| `/secrets` | Lista secrets + form de criação inline + delete inline |
| `/secrets/[name]` | Detalhe do secret (id, valor com toggle show/hide, contentType, status) + delete |
| `/keys` | Lista keys (read-only) |
| `/certificates` | Lista certificates (read-only) |

O layout (`+layout.svelte`) renderiza:
- Header azul escuro com `Key Vault Emulator — {KEYVAULT_TITLE}` + badge "local"
- Sidebar com links: Secrets, Keys, Certificates (highlight no ativo via `$app/state`)

---

## Docker

### Dockerfile
Multi-stage build:
1. `node:22-alpine` → `npm ci` + `npm run build`
2. `node:22-alpine` → copia `build/`, `package.json`, `node_modules`
3. Expõe porta 3000, entrypoint `node build`

### docker-compose.yml
Dois serviços:
- **kvemu**: build do `../backend` (deploy/Dockerfile), porta 13000, TLS auto, volumes p/ data + certs, healthcheck em `/healthz`
- **kv-interface**: build local, porta 3000, depende de `kvemu` healthy, `KEYVAULT_EMULATOR_URL=https://kvemu:13000`

---

## Estilo Visual

Tema inspirado no Azure Portal, definido via CSS custom properties no `app.css`:
- `--mc-blue`: `#0078d4` (links, botões primários)
- `--mc-bg`: `#f5f5f5` (fundo)
- `--mc-surface`: `#ffffff` (cards, tabelas)
- `--mc-border`: `#e1e1e1`
- `--mc-text`: `#1b1b1b`
- `--mc-text-muted`: `#605e5c`
- Font stack: Segoe UI, system-ui, sans-serif

---

## Comandos

```bash
npm run dev          # Dev server (Vite)
npm run build        # Build produção
npm run preview      # Preview do build
npm run check        # Type-check (svelte-check)
```

---

## Relação com kvemu

O frontend é um cliente data-plane puro do kvemu:
- Usa o mesmo fluxo OAuth2 que o SDK Azure (client_credentials)
- Não requer `/token` simplificado — usa os endpoints AAD fake padrão
- TLS autoassinado aceito (dev/local apenas)
- Compatível com qualquer instância kvemu (basta configurar URL + tenant ID)
