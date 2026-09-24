# Code to Block — Frontend

Aplicação web que permite ao usuário escrever chamadas de funções pré-definidas do Arduino em um editor de código e visualizar, em tempo real, os blocos de programação em blocos (estilo Blockly) correspondentes ao código digitado.

> **Importante:** este projeto não compila nem executa código Arduino. Ele apenas reconhece chamadas de funções conhecidas e as traduz visualmente em blocos, com base em um catálogo de funções fornecido pelo backend.

---

## Sumário
- [Requisitos Funcionais](#requisitos-funcionais)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Estratégia de Testes](#estratégia-de-testes)
- [Cronograma](#cronograma-fase-de-planejamento)

---

## Requisitos Funcionais 

Disponíveis no documento: 

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                         FRONTEND (SPA)                    │
│                                                             │
│  ┌───────────────┐   ┌────────────────┐   ┌────────────┐ │
│  │ Editor de     │──▶│ Parser/         │──▶│ Renderizador│ │
│  │ Código        │   │ Interpretador   │   │ de Blocos   │ │
│  │ (Monaco)      │   │ (client-side)   │   │ (Blockly)   │ │
│  └───────────────┘   └────────────────┘   └────────────┘ │
│          │                    ▲                            │
│          │                    │ catálogo de funções        │
│  ┌───────▼───────┐   ┌────────┴────────┐                  │
│  │ Auth (Google  │   │ Painel de       │                  │
│  │ OAuth/local)  │   │ Funções         │                  │
│  └───────────────┘   └─────────────────┘                  │
└──────────────────────────┬──────────────────────────────┘
                            │ HTTPS/REST (JSON)
                            ▼
                 API Backend (repositório separado)
```

**Fluxo principal:**
1. Usuário faz login (local ou Google) → recebe token da API.
2. Frontend busca o catálogo de funções na API (`GET /functions`).
3. Usuário digita uma chamada de função no editor.
4. O parser client-side identifica a função invocada e busca a definição de bloco correspondente (já carregada do catálogo).
5. O painel de blocos é atualizado via Blockly, renderizando o(s) bloco(s) na ordem de invocação.
6. Usuário pode salvar o projeto (`POST /projects`).

---

## Tecnologias

| Item | Escolha |
|---|---|
| Framework | React + TypeScript |
| Editor de código | Monaco Editor |
| Motor de blocos | Blockly |
| Cliente HTTP | Axios / Fetch API |
| Gerenciamento de estado | Context API ou Zustand |
| Autenticação (client) | Google Identity Services (OAuth 2.0) |
| Estilização | Tailwind CSS (ou CSS Modules) |
| Build tool | Vite |
| Testes unitários/componente | Jest + React Testing Library |
| Testes E2E | Playwright |
| Lint/Format | ESLint + Prettier |
| CI | GitHub Actions |

---

## Estrutura de Pastas

```
frontend/
├── src/
│   ├── components/         # componentes de UI (Editor, PainelBlocos, PainelFuncoes)
│   ├── features/
│   │   ├── auth/            # login, cadastro, integração Google OAuth
│   │   ├── editor/           # editor de código + parser client-side
│   │   ├── blocks/           # integração com Blockly, mapeamento função→bloco
│   ├── services/            # chamadas à API (auth.service.ts, functions.service.ts)
│   ├── hooks/
│   ├── types/               # tipos TS compartilhados (Function, Project, Block)
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── unit/
│   ├── component/
│   └── e2e/
├── .env.example
├── docker-compose.yml        
├── package.json
└── README.md
```

---

## Configuração do Ambiente

### Pré-requisitos
- Node.js 20+
- Backend rodando localmente (ver repositório de backend)

### Passos

```bash
# 1. Clonar o repositório
git clone <url-do-repo-frontend>
cd frontend

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com:
# VITE_API_URL=http://localhost:3000
# VITE_GOOGLE_CLIENT_ID=<client-id-do-google-console>

# 4. Rodar em modo desenvolvimento
npm run dev

# 5. Rodar testes
npm run test          # unitários + componente
npm run test:e2e      # end-to-end (Playwright)
```

### Variáveis de ambiente (`.env.example`)
```
VITE_API_URL=
VITE_GOOGLE_CLIENT_ID=
```

---

## Estratégia de Testes

| Tipo | Escopo | Ferramenta |
|---|---|---|
| Unitário | Parser (texto → tokens/AST), mapeamento função → definição de bloco | Jest |
| Componente | Editor (autocomplete, highlight), Painel de Blocos (renderização condicional) | React Testing Library |
| Integração (mock API) | Serviços de API mockados (auth, functions, projects) | Jest + MSW (Mock Service Worker) |
| E2E | Fluxo completo: login → escrever código → ver blocos → salvar projeto | Playwright |

**Meta de cobertura:** 70–80% nos módulos `editor/` (parser) e `blocks/` (mapeamento), por serem o núcleo funcional do produto.

**Pipeline de CI (GitHub Actions):**
```
lint → build → testes unitários/componente → testes E2E (headless) 
```

---

## Cronograma

| Sprint | Entregas do Frontend |
|---|---|
| 0 | Setup do projeto (Vite + React + TS), README, definição de componentes principais |
| 1 | Editor de código (Monaco) + integração inicial com Blockly (blocos estáticos de exemplo) |
| 2 | Parser client-side + mapeamento função → bloco consumindo catálogo mockado; testes unitários do parser + Integração com API real (auth + catálogo + projetos); testes de componente e E2E; revisão final |
