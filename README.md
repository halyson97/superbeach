# Beach Tennis - Sistema de Sorteio de Jogos

Aplicação web para organizar campeonatos de Beach Tennis com geração automática de confrontos (Round Robin), registro de resultados e classificação em tempo real.

## Tecnologias

- React + TypeScript
- Vite
- Material UI (MUI)
- React Hook Form
- Zustand
- LocalStorage

## Como executar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

## Build de produção

```bash
npm run build
npm run preview
```

## Funcionalidades

- Criação de campeonatos Individual ou Dupla Fixa
- 6, 8, 12 ou 16 jogadores
- 1 a 4 quadras com distribuição equilibrada
- Classificação por vitórias ou pontos
- Algoritmo Round Robin
- Persistência automática no LocalStorage
- Classificação em tempo real
- Tela final com campeão e pódio

## Estrutura

```
src/
 ├── pages/        # Telas da aplicação
 ├── components/   # Componentes reutilizáveis
 ├── store/        # Estado global (Zustand)
 ├── services/     # Persistência LocalStorage
 ├── types/        # Tipos TypeScript
 └── utils/        # Round Robin, ranking, etc.
```
