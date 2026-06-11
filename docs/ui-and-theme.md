# UI & Theme

**[🇺🇸 English](#english) · [🇧🇷 Português](#português)**

---

<a id="english"></a>
## 🇺🇸 English

### UI Routes

| Route | Description |
|---|---|
| `/` | Redirects to `/secrets` |
| `/secrets` | List all secrets with stats cards (total/enabled/disabled), inline create form, inline delete per row |
| `/secrets/[name]` | Secret detail: full ID, value with reveal/hide toggle + copy-to-clipboard, content type, metadata grid, danger zone delete card |
| `/keys` | List all keys with stats cards, read-only table |
| `/certificates` | List all certificates with stats cards, read-only table |
| `/vaults` | (v1.1) Vault CRUD: list, create, delete, export. Stats card showing total vaults |
| `/vaults/import` | (v1.1) Upload JSON export file with preview and import result |
| `/vaults/[name]/export` | (v1.1) Download vault as JSON |
| `/api/select-vault` | (v1.1) POST — sets `selected_vault` cookie and redirects |

### Layout (`+layout.svelte`)

- **Dark sidebar**: app brand ("kvemu — {title}"), nav items with SVG icons (Secrets, Keys, Certificates), active state with teal accent glow, Manage Vaults link in footer
- **Slim topbar**: "local" badge + vault selector dropdown (persisted via cookie)
- **Dark theme**: "Secure Console" — deep near-black backgrounds, teal accent, Sora + JetBrains Mono typography

### Design Tokens

CSS custom properties defined in `app.css`:

| Variable | Value | Usage |
|---|---|---|
| `--accent` | `#2dd4bf` | Primary actions, active states, links. Teal glow on hover |
| `--bg-root` | `#09090b` | Page background (near-black) |
| `--bg-surface` | `#111115` | Cards, sidebar, header |
| `--bg-elevated` | `#18181e` | Hover states, elevated surfaces |
| `--bg-input` | `#0e0e12` | Form inputs, textareas |
| `--border-default` | `#22222a` | Borders, dividers |
| `--border-subtle` | `#1a1a21` | Subtle borders in cards and tables |
| `--text-primary` | `#e8e8ed` | Headings, body text |
| `--text-secondary` | `#9a9aa8` | Secondary text |
| `--text-muted` | `#60607a` | Placeholders, muted info |
| `--success` / `--warning` / `--danger` / `--info` | `#4ade80` / `#fbbf24` / `#f87171` / `#60a5fa` | Semantic colors with corresponding `-subtle` variants for backgrounds |

**Typography:** Sora (UI) + JetBrains Mono (code, IDs, stat values). Imported via Google Fonts in `app.html`.

### Component Classes

All defined in `app.css`:

| Class | Description |
|---|---|
| `.btn` | Base button styles |
| `.btn-primary` | Teal accent button with glow on hover |
| `.btn-secondary` | Elevated surface button |
| `.btn-ghost` | Transparent text-only button |
| `.btn-danger` | Red-outlined destructive action |
| `.card` | Surface container with border and radius |
| `.card-header` | Header row with bottom border |
| `.card-body` | Padded content area |
| `.input` | Form input with dark background and accent focus ring |
| `.badge` | Inline status pill (success/warning/danger/info/muted variants) |
| `.stat-card` | Metric card with label + monospace value |
| `.table-container` | Bordered table wrapper with hover rows |
| `.empty-state` | Dashed-border placeholder with icon |
| `.nav-item` | Sidebar navigation link |
| `.link` | Inline accent-colored link |
| `.form-msg` | Form feedback banner (error/success) |
| `.mono` | Monospace font wrapper |
| `.page-header` / `.page-title` / `.page-subtitle` | Page heading layout |

### Key Features

- **Dark "Secure Console" theme** — refined near-black palette with teal accent, inspired by security operations tools
- **Multi-vault management** (v1.1) — create, list, delete, export, and import vaults via management API
- **Vault selector** — switch active vault from the topbar, persisted via cookie
- **Stats cards** — at-a-glance metrics (total/enabled/disabled) on every resource page
- **Copy to clipboard** — one-click copy for secret values on the detail page
- **Reveal/Hide toggle** — mask secret values with eye icon toggle
- **Danger zone cards** — destructive actions visually isolated with red borders
- **Server-side rendering** — SvelteKit server-side loads for fast initial page loads
- **Form actions** — progressive enhancement via SvelteKit `enhance()` (works without JavaScript)
- **OAuth2 authentication** — standard client_credentials flow against kvemu's fake AAD, token shared across vaults
- **Token caching** — JWT cached in memory with automatic refresh on 401/403
- **TLS tolerance** — accepts self-signed certificates (development only)
- **Docker Compose** — full stack in a single `docker compose up --build`

---

<a id="português"></a>
## 🇧🇷 Português

### Rotas da UI

| Rota | Descrição |
|---|---|
| `/` | Redireciona para `/secrets` |
| `/secrets` | Stats cards + tabela (nome, status, atualização, expiração). Formulário inline de criação. Botão deletar inline por linha. |
| `/secrets/[name]` | Detalhe do secret: ID completo, valor com toggle mostrar/ocultar + copiar, metadados, zona de perigo para deletar. |
| `/keys` | Stats cards + tabela (nome, status, atualização, expiração). Somente leitura. |
| `/certificates` | Stats cards + tabela (nome, status, atualização, expiração). Somente leitura. |
| `/vaults` | (v1.1) Gestão de vaults: criar, listar, deletar, exportar. Stats card mostrando total de vaults. |
| `/vaults/import` | (v1.1) Upload de JSON para importar vault com preview e resultado detalhado |
| `/vaults/[name]/export` | (v1.1) Download do vault como JSON |
| `/api/select-vault` | (v1.1) POST — seta cookie `selected_vault` e redireciona |

### Layout (`+layout.svelte`)

- **Sidebar escura**: marca ("kvemu — {title}"), itens de navegação com ícones SVG (Secrets, Keys, Certificates), estado ativo com glow teal, link Manage Vaults no rodapé
- **Topbar slim**: badge "local" verde + dropdown seletor de vault (persistido via cookie)
- **Tema dark**: "Secure Console" — fundos near-black profundos, acento teal, tipografia Sora + JetBrains Mono

### Design Tokens

Variáveis CSS definidas em `app.css`:

| Variável | Valor | Uso |
|---|---|---|
| `--accent` | `#2dd4bf` | Ações primárias, links, estados ativos. Glow teal no hover |
| `--bg-root` | `#09090b` | Fundo da página (near-black) |
| `--bg-surface` | `#111115` | Cards, sidebar, header |
| `--bg-elevated` | `#18181e` | Estados de hover, superfícies elevadas |
| `--bg-input` | `#0e0e12` | Inputs de formulário, textareas |
| `--border-default` | `#22222a` | Bordas, divisores |
| `--border-subtle` | `#1a1a21` | Bordas sutis em cards e tabelas |
| `--text-primary` | `#e8e8ed` | Títulos, corpo de texto |
| `--text-secondary` | `#9a9aa8` | Texto secundário |
| `--text-muted` | `#60607a` | Placeholders, informações menos relevantes |
| `--success` / `--warning` / `--danger` / `--info` | `#4ade80` / `#fbbf24` / `#f87171` / `#60a5fa` | Cores semânticas com variantes `-subtle` correspondentes para fundos |

**Tipografia:** Sora (UI) + JetBrains Mono (código, IDs, valores estatísticos). Importadas via Google Fonts no `app.html`.

### Classes de Componentes

Todas definidas em `app.css`:

| Classe | Descrição |
|---|---|
| `.btn` | Estilos base de botão |
| `.btn-primary` | Botão com acento teal e glow no hover |
| `.btn-secondary` | Botão com superfície elevada |
| `.btn-ghost` | Botão transparente somente texto |
| `.btn-danger` | Ação destrutiva com borda vermelha |
| `.card` | Container de superfície com borda e raio |
| `.card-header` | Linha de cabeçalho com borda inferior |
| `.card-body` | Área de conteúdo com padding |
| `.input` | Input de formulário com fundo escuro e anel de foco accent |
| `.badge` | Pill de status inline (variantes success/warning/danger/info/muted) |
| `.stat-card` | Card de métrica com label + valor monospace |
| `.table-container` | Wrapper de tabela com bordas e hover nas linhas |
| `.empty-state` | Placeholder com borda tracejada e ícone |
| `.nav-item` | Link de navegação da sidebar |
| `.link` | Link inline com cor accent |
| `.form-msg` | Banner de feedback de formulário (error/success) |
| `.mono` | Wrapper de fonte monospace |
| `.page-header` / `.page-title` / `.page-subtitle` | Layout de cabeçalho de página |

### Funcionalidades Principais

- **Tema dark "Secure Console"** — paleta near-black refinada com acento teal, inspirada em ferramentas de operações de segurança
- **Gestão multi-vault** (v1.1) — criar, listar, deletar, exportar e importar vaults via API de gestão
- **Seletor de vault** — alternar vault ativo pela topbar, persistido via cookie
- **Stats cards** — métricas rápidas (total/enabled/disabled) em cada página de recursos
- **Copiar para clipboard** — cópia em um clique para valores de secrets na página de detalhe
- **Toggle mostrar/ocultar** — mascarar valores de secrets com ícone de olho
- **Zonas de perigo** — ações destrutivas isoladas visualmente com bordas vermelhas
- **Renderização server-side** — carregamentos server-side do SvelteKit para carregamento inicial rápido
- **Form actions** — progressive enhancement via `enhance()` do SvelteKit (funciona sem JavaScript)
- **Autenticação OAuth2** — fluxo client_credentials padrão contra o AAD fake do kvemu, token compartilhado entre vaults
- **Cache de token** — JWT cacheado em memória com refresh automático em 401/403
- **Tolerância TLS** — aceita certificados autoassinados (apenas desenvolvimento)
- **Docker Compose** — stack completo em um único `docker compose up --build`
