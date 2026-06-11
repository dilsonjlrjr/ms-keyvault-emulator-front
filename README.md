# kv-interface — Key Vault Emulator Web UI

**[🇺🇸 English](#english) · [🇧🇷 Português](#português)**

---

<a id="english"></a>
## 🇺🇸 English

Web dashboard for [**kvemu**](../backend), an Azure Key Vault emulator. Browse, create, and manage Secrets, Keys, and Certificates from your browser.

**Stack:** SvelteKit 2 (Svelte 5 runes) · TypeScript 6 · Tailwind CSS 4 · Vite 8 · adapter-node · undici · Dark "Secure Console" theme · i18n (en/pt/es)

### Quick Start

```bash
docker compose up --build
```

Open **http://localhost:3000**.

### Documentation

| Document | Description |
|---|---|
| [Getting Started](docs/getting-started.md) | Docker setup, local development, environment variables |
| [Architecture](docs/architecture.md) | Project structure, API endpoints, auth flow, response types |
| [UI & Theme](docs/ui-and-theme.md) | Routes, layout, design system, visual tokens, key features |
| [Development](docs/development.md) | Build commands, Dockerfile, docker-compose |

---

<a id="português"></a>
## 🇧🇷 Português

Painel web para o [**kvemu**](../backend), um emulador do Azure Key Vault. Navegue, crie e gerencie Secrets, Keys e Certificates pelo navegador.

**Stack:** SvelteKit 2 (Svelte 5 runes) · TypeScript 6 · Tailwind CSS 4 · Vite 8 · adapter-node · undici · tema Dark "Secure Console" · i18n (en/pt/es)

### Início Rápido

```bash
docker compose up --build
```

Acesse **http://localhost:3000**.

### Documentação

| Documento | Descrição |
|---|---|
| [Primeiros Passos](docs/getting-started.md) | Setup Docker, desenvolvimento local, variáveis de ambiente |
| [Arquitetura](docs/architecture.md) | Estrutura do projeto, endpoints da API, fluxo de autenticação, tipos de resposta |
| [UI & Tema](docs/ui-and-theme.md) | Rotas, layout, design system, tokens visuais, funcionalidades |
| [Desenvolvimento](docs/development.md) | Comandos de build, Dockerfile, docker-compose |
