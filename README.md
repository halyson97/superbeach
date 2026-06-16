# Super Beach

Aplicação para organizar jogos de Beach Tennis com geração automática de confrontos, registro de resultados e classificação em tempo real.

## Estrutura do projeto

```
superbeach/
├── frontend/     # React + Vite + MUI
├── backend/      # Express + MongoDB + Mongoose
├── package.json  # Scripts para rodar ambos
└── README.md
```

## Como executar

### 1. Instalar dependências

```bash
npm run install:all
```

Ou separadamente:

```bash
npm install --prefix frontend
npm install --prefix backend
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure o backend:

```bash
cp backend/.env.example backend/.env
```

Variáveis no `backend/.env`:

- `MONGO_URI` — conexão MongoDB
- `JWT_SECRET` — chave para tokens de autenticação
- `PORT` — porta da API (padrão: 8000)

### 3. Rodar em desenvolvimento

**Terminal 1 — Backend:**
```bash
npm run dev:backend
```

**Terminal 2 — Frontend:**
```bash
npm run dev:frontend
```

Acesse `http://localhost:5173`

O frontend faz proxy das requisições `/api` para `http://localhost:8000`.

## Build de produção

```bash
npm run build
```

## Funcionalidades

- Cadastro e login de usuários
- Jogos salvos no MongoDB (cada usuário vê apenas os seus)
- Individual, Dupla Fixa e Mix
- Classificação por vitórias ou pontos
- Histórico de partidas e jogos finalizados
- Compartilhamento de link para acompanhamento público

## Tecnologias

**Frontend:** React, TypeScript, Vite, MUI, Zustand, React Hook Form

**Backend:** Express.js, MongoDB, Mongoose, JWT, bcrypt
