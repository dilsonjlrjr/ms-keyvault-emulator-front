# kv-interface — Key Vault Emulator Web UI

**[🇺🇸 English](#english) · [🇧🇷 Português](#português)**

---

<a id="english"></a>
## 🇺🇸 English

Web dashboard (SPA) for [**kvemu**](../backend), an Azure Key Vault emulator. Browse, create, and manage Secrets, Keys, and Certificates from your browser — across multiple vaults, switchable from the header.

**SPA mode** — all rendering is client-side. Data is fetched via AJAX to proxy endpoints (`/api/vault/{vault}/kv/...`, `/api/mgmt/...`) that forward to kvemu's `/ui` plane. Vault selection is stored in `localStorage`.

**Stack:** SvelteKit 2 (Svelte 5 runes) · TypeScript 6 · Tailwind CSS 4 · Vite 8 · adapter-node · undici · Dark "Secure Console" theme · i18n (en/pt/es)

### Quick Start

```bash
docker compose up --build
```

Open **http://localhost:3000**.

### API Endpoints

| URL | Description |
|-----|-------------|
| `GET /api/vault/{vault}/kv/secrets` | List secrets |
| `GET /api/vault/{vault}/kv/secrets/{name}` | Get secret |
| `GET /api/vault/{vault}/kv/keys` | List keys |
| `GET /api/vault/{vault}/kv/certificates` | List certificates |
| `GET /api/mgmt/vaults` | List vaults |
| `POST /api/mgmt/vaults` | Create vault |
| `DELETE /api/mgmt/vaults/{name}` | Delete vault |

---

<a id="português"></a>
## 🇧🇷 Português

Painel web (SPA) para o [**kvemu**](../backend), um emulador do Azure Key Vault. Navegue, crie e gerencie Secrets, Keys e Certificates pelo navegador — em múltiplos vaults, alternáveis pelo header.

**Modo SPA** — toda renderização é client-side. Dados são buscados via AJAX para endpoints proxy (`/api/vault/{vault}/kv/...`, `/api/mgmt/...`) que encaminham ao plano `/ui` do kvemu. A seleção de vault fica em `localStorage`.

**Stack:** SvelteKit 2 (Svelte 5 runes) · TypeScript 6 · Tailwind CSS 4 · Vite 8 · adapter-node · undici · tema Dark "Secure Console" · i18n (en/pt/es)

### Início Rápido

```bash
docker compose up --build
```

Acesse **http://localhost:3000**.

### Endpoints da API

| URL | Descrição |
|-----|-----------|
| `GET /api/vault/{vault}/kv/secrets` | Lista secrets |
| `GET /api/vault/{vault}/kv/secrets/{name}` | Obtém secret |
| `GET /api/vault/{vault}/kv/keys` | Lista keys |
| `GET /api/vault/{vault}/kv/certificates` | Lista certificates |
| `GET /api/mgmt/vaults` | Lista vaults |
| `POST /api/mgmt/vaults` | Cria vault |
| `DELETE /api/mgmt/vaults/{name}` | Deleta vault |
