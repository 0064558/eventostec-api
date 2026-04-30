# EventosTec Frontend

Frontend em React + Vite para consumir a API `eventostec-api`.

## Funcionalidades

- Listagem de eventos futuros com paginação
- Filtros por título, cidade, UF e período
- Detalhes de evento com cupons válidos
- Cadastro de evento com `multipart/form-data` (inclui imagem)
- Cadastro de cupom por evento

## Rodando localmente

```bash
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

## Configuração de API

Crie um arquivo `.env` com:

```env
VITE_API_BASE_URL=
```

- Vazio (`""`): usa proxy do Vite para `http://localhost:8080`
- URL definida: usa diretamente a URL informada (ex: EC2)

## Scripts

- `npm run dev` inicia ambiente de desenvolvimento
- `npm run lint` valida código
- `npm run build` gera build de produção
- `npm run preview` sobe preview do build
