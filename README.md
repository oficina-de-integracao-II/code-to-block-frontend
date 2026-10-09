# Code to Block — Frontend

Aplicação web que permitirá ao usuário escrever chamadas de funções pré-definidas do Arduino em um editor de código e visualizar, em tempo real, os blocos de programação correspondentes, em um estilo semelhante ao Blockly.

> **Importante:** o projeto não compila nem executa código Arduino. A proposta é reconhecer chamadas de funções conhecidas e representá-las visualmente em blocos, com base em um catálogo de funções fornecido pelo backend.

## Sumário

- [Requisitos Funcionais](#requisitos-funcionais)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Estratégia de Testes](#estratégia-de-testes)
- [Cronograma](#cronograma)

## Requisitos Funcionais

Os requisitos funcionais estão documentados em [REQUISITOS.md](./REQUISITOS.md).

## Arquitetura

A arquitetura planejada para a aplicação é composta por:

- **Editor de código:** recebe as chamadas de funções escritas pelo usuário.
- **Parser/interpretador:** identifica as funções conhecidas no código, no próprio frontend.
- **Renderizador de blocos:** representa visualmente as chamadas reconhecidas.
- **Painel de funções:** apresenta o catálogo de funções disponibilizado pelo backend.
- **Autenticação:** permite o acesso à aplicação.
- **API backend:** fornece o catálogo e oferece operações para autenticação e gerenciamento de projetos.

Fluxo principal planejado:

1. O usuário realiza o login.
2. O frontend consulta o catálogo de funções da API.
3. O usuário escreve chamadas de funções no editor.
4. O parser identifica as chamadas conhecidas.
5. O painel de blocos é atualizado conforme o código.
6. O usuário poderá salvar o projeto pela API.

A implementação dessas funcionalidades ocorrerá nas próximas etapas do projeto.

## Tecnologias

| Área | Tecnologia |
|---|---|
| Framework | React |
| Linguagem | TypeScript |
| Build e desenvolvimento | Vite |
| Testes unitários e de componentes | Vitest |
| Testes de interface | React Testing Library |
| Matchers para testes DOM | `@testing-library/jest-dom` |
| Ambiente DOM de testes | jsdom |
| Mock de requisições HTTP | MSW |
| Cobertura de testes | Vitest + V8 |
| Lint | ESLint |
| Formatação | Prettier |
| CI | GitHub Actions |

Monaco Editor, Blockly, autenticação, cliente HTTP e demais tecnologias funcionais serão integrados conforme o desenvolvimento da aplicação.

## Estrutura de Pastas

Estrutura atual e organização planejada:

```text
code-to-block-frontend/
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
├── src/
│   ├── test/
│   │   ├── handlers.ts
│   │   ├── server.ts
│   │   └── setup.ts
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   ├── App.test.tsx
│   └── main.tsx
├── .env.example
├── package.json
├── vite.config.ts
├── tsconfig.json
├── REQUISITOS.md
└── README.md
```

À medida que as funcionalidades forem desenvolvidas, a estrutura será expandida com componentes, serviços e módulos em `features/`, incluindo `features/editor` e `features/blocks`.

## Configuração do Ambiente

### Pré-requisitos

- Node.js compatível com a versão do Vite utilizada.
- npm.

### Instalação

```bash
git clone https://github.com/oficina-de-integracao-II/code-to-block-frontend.git
cd code-to-block-frontend
npm ci
```

### Variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Preencha as variáveis necessárias conforme as integrações que forem implementadas. A URL da API e as credenciais de autenticação serão utilizadas quando essas integrações estiverem disponíveis.

### Executar a aplicação

```bash
npm run dev
```

### Executar os testes

```bash
# Executar todos os testes uma vez
npm run test

# Executar em modo watch
npm run test:watch

# Executar os testes e gerar relatório de cobertura
npm run test:cov
```

### Validar o projeto

```bash
npm run lint
npm run build
```

## Estratégia de Testes

A infraestrutura de testes utiliza Vitest, React Testing Library e MSW.

### Organização dos testes

- **Unitários:** funções isoladas, como o parser e o mapeamento de funções para blocos.
- **Componentes:** comportamento e renderização de componentes React.
- **Integração com API:** chamadas HTTP utilizando MSW para simular as respostas do backend.
- **E2E:** fluxos completos da aplicação, a serem configurados em uma etapa futura.

Os testes devem ficar próximos dos módulos correspondentes ou em arquivos `.test.ts` e `.test.tsx`, seguindo o padrão adotado pelo projeto.

### Utilização do MSW

Os arquivos relacionados aos mocks ficam em `src/test/`:

- `handlers.ts`: define os handlers das requisições HTTP simuladas.
- `server.ts`: configura o servidor MSW para os testes.
- `setup.ts`: inicia e encerra o servidor e restaura os handlers entre os testes.

Para adicionar um mock, registre um handler em `handlers.ts` ou configure uma resposta específica no teste com `server.use()`. As requisições não interceptadas geram erro durante os testes.

O contrato OpenAPI do backend ainda não está definido. Os handlers correspondentes à API serão adicionados quando os endpoints forem acordados com o time de backend.

### Cobertura

O Vitest utiliza o provider V8 para gerar relatórios em texto e HTML.

A meta planejada é de pelo menos 70% de cobertura nos módulos `features/editor` e `features/blocks`. Os limites serão aplicados no CI quando a estrutura dessas funcionalidades estiver disponível.

### Integração contínua

O GitHub Actions executa:

1. Instalação das dependências.
2. Lint.
3. Testes automatizados.
4. Build da aplicação.

A execução com cobertura também deve ser validada no CI conforme a configuração da tarefa de infraestrutura.

## Cronograma

| Sprint | Entregas planejadas |
|---|---|
| 0 | Configuração do projeto, documentação e infraestrutura de testes. |
| 1 | Editor de código e integração inicial com Blockly. |
| 2 | Parser, mapeamento de funções para blocos, integração com a API e testes das funcionalidades. |