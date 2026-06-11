# Getting Started

**[🇺🇸 English](#english) · [🇧🇷 Português](#português)**

---

<a id="english"></a>
## 🇺🇸 English

### Docker

With Docker installed, start both the emulator and the UI:

```bash
docker compose up --build
```

This launches two services (see [`docker-compose.yml`](../docker-compose.yml)):

- **`kvemu`** — built from `../backend`, exposed on `https://localhost:13000`, with auto-generated TLS, persistent SQLite storage, and a fake AAD identity provider.
- **`kv-interface`** — this UI, exposed on `http://localhost:3000`, configured to find the emulator at `https://kvemu:13000` (resolved by the internal Compose network).

Open the UI at **http://localhost:3000**.

### Local Development

Run the frontend directly (the kvemu emulator must already be running):

```bash
cp .env.example .env          # edit KEYVAULT_EMULATOR_URL and KEYVAULT_TENANT_ID if needed
npm install
npm run dev -- --open
```

Make sure kvemu is running (e.g., via `make run` in the backend directory). The `.env.example` points to `https://localhost:13000` by default.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `KEYVAULT_EMULATOR_URL` | `https://localhost:13000` | Base URL of the kvemu emulator |
| `KEYVAULT_TENANT_ID` | `a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f` | AAD tenant ID for OAuth2 token endpoint |
| `KEYVAULT_TITLE` | `One Keyvault` | Title displayed in the sidebar |
| `KEYVAULT_BASE_DOMAIN` | `kvemu.local` | Base domain for vault subdomains (v1.1) |
| `KEYVAULT_DEFAULT_VAULT` | `vault` | Default vault name when no cookie is set (v1.1) |
| `PORT` | `3000` | SvelteKit server listen port |
| `ORIGIN` | `http://localhost:3000` | Public origin for form validation / CSRF |

> TLS certificate validation is disabled (`rejectUnauthorized: false`) when talking to the emulator — kvemu uses self-signed certificates for local development. **Never point this at a production Azure Key Vault.**

---

<a id="português"></a>
## 🇧🇷 Português

### Docker

Com Docker instalado, suba o emulador e a interface juntos:

```bash
docker compose up --build
```

Isso inicia dois serviços (veja [`docker-compose.yml`](../docker-compose.yml)):

- **`kvemu`** — build do `../backend`, exposto em `https://localhost:13000`, com TLS auto-gerado, armazenamento SQLite persistente e provedor de identidade AAD fake.
- **`kv-interface`** — esta interface, exposta em `http://localhost:3000`, configurada para encontrar o emulador em `https://kvemu:13000` (resolvido pela rede interna do Compose).

Acesse a interface em **http://localhost:3000**.

### Desenvolvimento Local

Para desenvolvimento local, rode o frontend diretamente (o emulador kvemu precisa estar rodando):

```bash
cp .env.example .env          # edite KEYVAULT_EMULATOR_URL e KEYVAULT_TENANT_ID se necessário
npm install
npm run dev -- --open
```

Certifique-se de que o kvemu está rodando (ex: `make run` no diretório backend). O `.env.example` aponta para `https://localhost:13000` por padrão.

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `KEYVAULT_EMULATOR_URL` | `https://localhost:13000` | URL base do emulador kvemu |
| `KEYVAULT_TENANT_ID` | `a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f` | ID do tenant AAD para o endpoint de token OAuth2 |
| `KEYVAULT_TITLE` | `One Keyvault` | Título exibido na sidebar |
| `KEYVAULT_BASE_DOMAIN` | `kvemu.local` | Domínio base para subdomínios de vaults (v1.1) |
| `KEYVAULT_DEFAULT_VAULT` | `vault` | Nome do vault padrão (v1.1) |
| `PORT` | `3000` | Porta de escuta do servidor SvelteKit |
| `ORIGIN` | `http://localhost:3000` | Origem pública para validação de formulários / CSRF |

> A validação do certificado TLS é desabilitada (`rejectUnauthorized: false`) ao falar com o emulador — o kvemu usa certificados autoassinados para desenvolvimento local. **Nunca aponte esta interface para um Key Vault Azure real em produção.**
