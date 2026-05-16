# Sistema de Controle de Ferramentas

Sistema web para gerenciamento de ferramentas, empréstimos e solicitações, com controle de acesso por perfil de usuário.

> Projeto acadêmico — Arquitetura MVC desacoplada (NestJS + React)

---

## Sumário

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Banco de Dados](#banco-de-dados)
- [Autenticação e Perfis](#autenticação-e-perfis)
- [Como Rodar](#como-rodar)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)

---

## Visão Geral

O sistema permite que técnicos solicitem empréstimos de ferramentas, almoxarifes gerenciem o estoque e registrem empréstimos, e coordenadores tenham uma visão gerencial com relatórios. Toda a comunicação entre frontend e backend é feita via REST API com autenticação JWT.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                       USUÁRIO                           │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│              FRONTEND  (React + Vite)                   │
│                   localhost:5173                        │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Páginas   │  │  AuthContext │  │   Services    │  │
│  │  por perfil │  │  (JWT state) │  │  (API calls)  │  │
│  └─────────────┘  └──────────────┘  └───────┬───────┘  │
└──────────────────────────────────────────────┼──────────┘
                                               │ HTTP + Bearer Token
┌──────────────────────────────────────────────▼──────────┐
│              BACKEND  (NestJS)                          │
│                   localhost:3000/api                    │
│                                                         │
│  ┌──────────┐ ┌───────────┐ ┌───────────┐ ┌─────────┐  │
│  │   Auth   │ │Ferramentas│ │Emprestimos│ │Solicit. │  │
│  │ /api/auth│ │/api/ferr..│ │/api/empr..│ │/api/sol.│  │
│  └──────────┘ └───────────┘ └───────────┘ └─────────┘  │
│                                                         │
│  ┌──────────┐ ┌───────────┐                             │
│  │ Usuarios │ │Relatorios │                             │
│  └──────────┘ └───────────┘                             │
│                          │                              │
│                   ┌──────▼──────┐                       │
│                   │   Prisma    │                       │
│                   │    ORM      │                       │
└───────────────────┴──────┬──────┴───────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│           BANCO DE DADOS (PostgreSQL / Supabase)        │
│                                                         │
│   usuarios  ferramentas  emprestimos  solicitacoes      │
└─────────────────────────────────────────────────────────┘
```

O frontend consome a API REST do backend. O backend valida o token JWT em cada requisição protegida e aplica controle de acesso por perfil via guards.

---

## Tecnologias

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| NestJS | 10 | Framework da API |
| TypeScript | 5.1 | Linguagem |
| Prisma | 5.22 | ORM / migrations |
| PostgreSQL | — | Banco de dados (Supabase) |
| Passport + JWT | — | Autenticação |
| bcryptjs | — | Hash de senhas |
| class-validator | — | Validação de DTOs |

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18.3 | UI |
| TypeScript | — | Linguagem |
| Vite | 6.3 | Build / dev server |
| React Router | 7.13 | Navegação |
| React Hook Form | 7.55 | Formulários |
| Tailwind CSS | 4.1 | Estilização |
| Shadcn/Radix UI | — | Componentes |
| Recharts | 2.15 | Gráficos |
| Sonner | — | Notificações toast |

---

## Estrutura de Pastas

```
Sistema de Ferramentas/
├── Backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos do banco
│   │   └── seed.ts             # Dados iniciais
│   ├── src/
│   │   ├── main.ts             # Entrada da aplicação
│   │   ├── app.module.ts       # Módulo raiz
│   │   ├── auth/               # Autenticação JWT
│   │   │   ├── guards/         # JwtAuthGuard, RolesGuard
│   │   │   ├── strategies/     # Passport JWT strategy
│   │   │   ├── decorators/     # @CurrentUser, @Roles
│   │   │   └── dto/            # LoginDto, RegisterDto
│   │   ├── ferramentas/        # CRUD de ferramentas
│   │   ├── emprestimos/        # Gestão de empréstimos
│   │   ├── solicitacoes/       # Fluxo de solicitações
│   │   ├── usuarios/           # Gestão de usuários
│   │   ├── relatorios/         # Geração de relatórios
│   │   └── prisma/             # PrismaService (singleton)
│   ├── .env                    # Variáveis de ambiente
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── main.tsx            # Entrada React
│   │   ├── app/
│   │   │   ├── App.tsx         # Rotas e layout principal
│   │   │   └── components/ui/  # Componentes Shadcn
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── AppLayout.tsx     # Layout com sidebar
│   │   │       └── PrivateRoute.tsx  # Proteção de rotas
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx  # Estado global de autenticação
│   │   ├── pages/
│   │   │   ├── auth/            # Login, Register, ForgotPassword
│   │   │   ├── tecnico/         # Dashboard do Técnico
│   │   │   ├── almoxarife/      # Dashboard do Almoxarife
│   │   │   ├── coordenador/     # Dashboard do Coordenador
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── CatalogoPage.tsx
│   │   │   ├── EmprestimosPage.tsx
│   │   │   ├── SolicitacoesPage.tsx
│   │   │   ├── DisponibilidadePage.tsx
│   │   │   ├── HistoricoPage.tsx
│   │   │   └── RelatoriosPage.tsx
│   │   └── services/
│   │       ├── api.ts                # Cliente base com token
│   │       ├── auth.service.ts
│   │       ├── ferramentas.service.ts
│   │       ├── emprestimos.service.ts
│   │       ├── solicitacoes.service.ts
│   │       └── usuarios.service.ts
│   └── package.json
│
├── scripts/
│   ├── dev.ps1                 # Abre backend + frontend no Windows Terminal
│   └── dev.bat                 # Atalho para executar o dev.ps1
│
└── package.json                # Scripts raiz (npm run dev:all)
```

---

## Banco de Dados

### Modelos

```
Usuario
├── id, nome, username, email, senha
├── perfil: coordenador | almoxarife | tecnico
└── relações: emprestimos, solicitacoes

Ferramenta
├── id, codigo (único), nome, categoria, marca
├── estado: disponivel | emprestada | manutencao | danificada
├── estadoConservacao: excelente | bom | regular | ruim
└── relações: emprestimos, solicitacoes

Emprestimo
├── ferramentaId, responsavelId, registradoPorId
├── dataRetirada, dataDevolucaoPrevista, dataDevolucaoReal
└── status: ativo | devolvido | atrasado

Solicitacao
├── ferramentaId, solicitanteId
├── previsaoDevolucao, motivoRejeicao
└── status: pendente | aprovada | rejeitada
```

### Relações

```
Usuario      ──< Emprestimo (como responsável)
Usuario      ──< Emprestimo (como quem registrou)
Usuario      ──< Solicitacao
Ferramenta   ──< Emprestimo
Ferramenta   ──< Solicitacao
```

---

## Autenticação e Perfis

O login retorna um token JWT que é armazenado no frontend e enviado no header `Authorization: Bearer <token>` em todas as requisições protegidas.

### Perfis e Acessos

| Perfil | Acesso |
|---|---|
| **Técnico** | Consulta catálogo, visualiza disponibilidade, abre solicitações, vê histórico próprio |
| **Almoxarife** | Tudo do técnico + registra empréstimos, aprova/rejeita solicitações, gerencia ferramentas |
| **Coordenador** | Acesso total + relatórios gerenciais, gestão de usuários |

---

## Como Rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- Banco PostgreSQL (ou conta no [Supabase](https://supabase.com))

### 1. Clonar e instalar dependências

```bash
# Backend
cd Backend
npm install

# Frontend
cd ../Frontend
pnpm install
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar o exemplo e preencher com suas credenciais
cp Backend/.env.example Backend/.env
```

Edite `Backend/.env`:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/banco"
JWT_SECRET="um_segredo_forte_aqui"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 3. Rodar migrations e gerar o client Prisma

```bash
cd Backend
npm run db:migrate   # Aplica as migrations no banco
npm run db:generate  # Gera o Prisma Client
npm run db:seed      # (Opcional) Popula dados iniciais
```

### 4. Iniciar o projeto

#### Opção A — Script automático (recomendado)

Na raiz do projeto:

```bash
npm run dev:all
```

Isso abre dois terminais separados no Windows Terminal:
- **Backend** em `http://localhost:3000/api`
- **Frontend** em `http://localhost:5173`

#### Opção B — Manualmente

```bash
# Terminal 1 — Backend
cd Backend
npm run start:dev

# Terminal 2 — Frontend
cd Frontend
pnpm dev
```

---

## Variáveis de Ambiente

### Backend (`Backend/.env`)

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Chave secreta para assinar tokens | string aleatória longa |
| `JWT_EXPIRES_IN` | Expiração do token | `7d` |
| `PORT` | Porta da API | `3000` |

---

## Scripts Disponíveis

### Raiz
| Comando | Descrição |
|---|---|
| `npm run dev:all` | Inicia backend e frontend em terminais separados |

### Backend (`cd Backend`)
| Comando | Descrição |
|---|---|
| `npm run start:dev` | Inicia com hot-reload |
| `npm run build` | Compila para produção |
| `npm run start` | Inicia build de produção |
| `npm run db:migrate` | Aplica migrations |
| `npm run db:generate` | Gera Prisma Client |
| `npm run db:seed` | Popula banco com dados iniciais |
| `npm run db:studio` | Abre Prisma Studio (GUI do banco) |

### Frontend (`cd Frontend`)
| Comando | Descrição |
|---|---|
| `pnpm dev` | Inicia servidor de desenvolvimento |
| `pnpm build` | Gera build de produção |
