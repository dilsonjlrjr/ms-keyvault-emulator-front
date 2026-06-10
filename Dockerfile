# --- build stage ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- runtime stage ---
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

# URL do emulador do Key Vault que esta interface vai consumir.
# Sobrescreva via `docker run -e KEYVAULT_EMULATOR_URL=...` ou docker-compose.
ENV KEYVAULT_EMULATOR_URL=https://host.docker.internal:13000

# Domínio base para hostnames dos vaults (multi-vault v1.1)
ENV KEYVAULT_BASE_DOMAIN=kvemu.local

# Nome do vault padrão (multi-vault v1.1)
ENV KEYVAULT_DEFAULT_VAULT=vault

# Tenant ID usado no fluxo OAuth2 client_credentials contra o AAD fake do kvemu.
ENV KEYVAULT_TENANT_ID=a0c2a3f5-e1b3-4d6a-9c41-2cdd1f2c7e0f

# Título exibido ao lado de "Key Vault Emulator" no cabeçalho da interface.
# Ex.: KEYVAULT_TITLE="Meu KeyVault" -> "Key Vault Emulator - Meu KeyVault"
ENV KEYVAULT_TITLE="One Keyvault"

ENV PORT=3000
ENV ORIGIN=http://localhost:3000

EXPOSE 3000

CMD ["node", "build"]
