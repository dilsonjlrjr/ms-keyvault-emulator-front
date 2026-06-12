# Development

**[🇺🇸 English](#english) · [🇧🇷 Português](#português)**

---

<a id="english"></a>
## 🇺🇸 English

### Build Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server with hot reload (Vite)
npm run dev -- --open    # Dev server + open browser

npm run check            # Type-check (svelte-check)
npm run build            # Production build (adapter-node)
npm run preview          # Preview production build locally

docker compose up --build   # Full stack (kvemu + UI)
```

### Dockerfile

Multi-stage build:

1. **Build stage** (`node:22-alpine`): `npm ci` → `npm run build`
2. **Runtime stage** (`node:22-alpine`): copies `build/`, `package.json`, `node_modules`. Exposes port 3000. Entrypoint: `node build`.

### docker-compose.yml

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
    healthcheck:
      test: ["CMD", "wget", "--no-check-certificate", "-qO-", "https://localhost:13000/healthz"]
      interval: 5s
      retries: 5

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

<a id="português"></a>
## 🇧🇷 Português

### Comandos de Build

```bash
npm install              # Instalar dependências
npm run dev              # Servidor de desenvolvimento com hot reload (Vite)
npm run dev -- --open    # Dev server + abrir navegador

npm run check            # Type-check (svelte-check)
npm run build            # Build de produção (adapter-node)
npm run preview          # Previsualizar build de produção localmente

docker compose up --build   # Stack completo (kvemu + interface)
```

### Dockerfile

Build multi-stage:

1. **Estágio de build** (`node:22-alpine`): `npm ci` → `npm run build`
2. **Estágio de runtime** (`node:22-alpine`): copia `build/`, `package.json`, `node_modules`. Expõe porta 3000. Entrypoint: `node build`.

### docker-compose.yml

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
    healthcheck:
      test: ["CMD", "wget", "--no-check-certificate", "-qO-", "https://localhost:13000/healthz"]
      interval: 5s
      retries: 5

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
