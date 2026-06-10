# Key Vault Emulator — Interface

Interface web (SvelteKit + Tailwind, no padrão visual do Azure Portal) para o
[Azure Key Vault Emulator](https://github.com/james-gould/azure-keyvault-emulator)
(`jamesgoulddev/azure-keyvault-emulator`). Permite visualizar, criar e remover
**Secrets**, e listar **Keys** e **Certificates** do emulador.

## Sumário

- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [1. Gerar os certificados SSL do emulador](#1-gerar-os-certificados-ssl-do-emulador)
- [2. Instalar o certificado como Trusted Root CA](#2-instalar-o-certificado-como-trusted-root-ca)
- [3. Subir tudo com Docker Compose](#3-subir-tudo-com-docker-compose)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Desenvolvimento local (sem Docker)](#desenvolvimento-local-sem-docker)

## Arquitetura

```
┌─────────────────────┐        HTTPS (TLS auto-assinado)       ┌──────────────────────────────┐
│   kv-interface       │ ───────────────────────────────────▶ │   keyvault-emulator           │
│   (SvelteKit/Node)   │   KEYVAULT_EMULATOR_URL                │   jamesgoulddev/...:latest    │
│   porta 3000         │                                        │   porta 4997 (REST Key Vault) │
└─────────────────────┘                                        └──────────────────────────────┘
```

A interface roda em container próprio e descobre o emulador através da variável
de ambiente `KEYVAULT_EMULATOR_URL`.

## Pré-requisitos

- [Docker](https://www.docker.com/) (ou Podman configurado para comandos `docker`)
- `openssl` disponível no terminal (já vem com `git` no Windows, em
  `C:\Program Files\Git\usr\bin`)

## 1. Gerar os certificados SSL do emulador

O emulador exige `HTTPS` com um certificado confiável — sem isso, o SDK do
Azure (e esta interface) não conseguem se conectar.

> [!IMPORTANT]
> Limitação conhecida do emulador: o **nome** e a **senha** do certificado
> devem ser, obrigatoriamente, `emulator`.

Use o script incluído neste projeto, que automatiza a geração via `openssl`:

```sh
./scripts/generate-certs.sh
```

Isso cria, dentro de `./certs/` (a pasta já é montada pelo `docker-compose.yml`):

| Arquivo          | Descrição                                  |
| ---------------- | ------------------------------------------ |
| `emulator.key`   | Chave privada                               |
| `emulator.crt`   | Certificado público (Linux/macOS)           |
| `emulator.pfx`   | Pacote PFX, senha `emulator` (Windows)      |

Você pode opcionalmente passar um diretório de saída diferente:

```sh
./scripts/generate-certs.sh /caminho/para/certs
```

> [!TIP]
> Alternativamente, a própria comunidade do emulador disponibiliza um script
> interativo que automatiza geração **e** instalação dos certificados:
> ```sh
> bash <(curl -fsSL https://raw.githubusercontent.com/james-gould/azure-keyvault-emulator/refs/heads/master/docs/setup.sh)
> ```
> No Windows, rode-o via `Git Bash` ou `wsl -u root`.

## 2. Instalar o certificado como Trusted Root CA

O sistema operacional precisa confiar no certificado gerado. Escolha o comando
de acordo com o seu SO:

**Linux**

```sh
sudo cp certs/emulator.crt /usr/local/share/ca-certificates/emulator.crt
sudo update-ca-certificates
```

**macOS**

```sh
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain certs/emulator.crt
```

**Windows**

- Clique com o botão direito em `certs\emulator.pfx` → **Instalar PFX**
- Siga o assistente selecionando **Trusted Root Certification Authorities**
- Senha do certificado: `emulator`

> Após instalar, talvez seja necessário reiniciar o terminal/navegador para que
> a nova autoridade confiável seja reconhecida.

### Aplicações Java (Spring Boot + Azure SDK)

O Azure SDK para Java usa o truststore próprio da JVM, que não herda automaticamente
os certificados instalados no sistema operacional. Se sua aplicação Spring Boot lança
`SSLHandshakeException: PKIX path building failed` ao conectar no emulador, é preciso
importar o certificado diretamente no `cacerts` da JVM que roda o projeto.

Descubra o caminho do `cacerts` de acordo com seu gerenciador de JVMs:

**asdf**

```sh
# Liste as instalações Java disponíveis
find ~/.asdf/installs/java -name "cacerts" | grep "21"  # ajuste a versão
```

**SDKMAN**

```sh
find ~/.sdkman/candidates/java -name "cacerts" | grep "21"
```

**Instalação padrão (macOS)**

```sh
/usr/libexec/java_home -v 21
# O cacerts fica em: <saída acima>/lib/security/cacerts
```

Com o caminho em mãos, execute o `keytool` (substituindo `<CACERTS_PATH>`):

```sh
keytool -import \
  -trustcacerts \
  -alias kv-emulator-local \
  -file certs/emulator.crt \
  -keystore <CACERTS_PATH> \
  -storepass changeit \
  -noprompt
```

> A mensagem `Advertência: use a opção -cacerts` é apenas informativa — o certificado
> é importado normalmente. Reinicie a aplicação após o comando.

## 3. Subir tudo com Docker Compose

Com os certificados em `./certs/`, suba o emulador **e** a interface juntos:

```sh
docker compose up --build
```

Isso inicia dois serviços (veja [`docker-compose.yml`](./docker-compose.yml)):

- **`keyvault-emulator`** — `jamesgoulddev/azure-keyvault-emulator:latest`,
  exposto em `https://localhost:4997`, com `Persist=true` (dados gravados em
  `./certs/emulator.db`) e os certificados montados em `/certs`.
- **`kv-interface`** — esta interface, exposta em `http://localhost:3000`,
  configurada para encontrar o emulador em `https://keyvault-emulator:4997`
  (nome do serviço, resolvido pela rede interna do Compose).

Acesse a interface em **http://localhost:3000**.

### Apontando para um emulador externo

Se o emulador já estiver rodando em outro host/porta, basta sobrescrever a
variável de ambiente antes de subir só a interface:

```sh
KEYVAULT_EMULATOR_URL=https://meu-host:4997 docker compose up --build kv-interface
```

## Variáveis de ambiente

| Variável                | Descrição                                                              | Padrão (compose)                     |
| ----------------------- | ---------------------------------------------------------------------- | ------------------------------------- |
| `KEYVAULT_EMULATOR_URL` | URL base do emulador do Key Vault que a interface vai consultar.       | `https://keyvault-emulator:4997`       |
| `KEYVAULT_TITLE`        | Título exibido ao lado de "Key Vault Emulator" no cabeçalho. Ex.: `KEYVAULT_TITLE="Meu KeyVault"` exibe "Key Vault Emulator - Meu KeyVault". | `One Keyvault` |
| `PORT`                  | Porta em que o servidor SvelteKit escuta dentro do container.          | `3000`                                 |
| `ORIGIN`                | Origem pública usada pelo SvelteKit para validação de formulários/CSRF.| `http://localhost:3000`                |

> A interface ignora a validação de TLS ao falar com o emulador (certificado
> autoassinado, ambiente de desenvolvimento). **Não use esta configuração
> apontando para um Key Vault real em produção.**

## Desenvolvimento local (sem Docker)

```sh
cp .env.example .env       # ajuste KEYVAULT_EMULATOR_URL se necessário
npm install
npm run dev -- --open
```

Outros comandos úteis:

```sh
npm run check     # type-check do projeto (svelte-check)
npm run build     # build de produção (adapter-node)
npm run preview   # serve o build de produção localmente
```
