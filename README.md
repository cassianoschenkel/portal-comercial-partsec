# Portal Comercial Partsec

MVP interno para cadastro de clientes, base de propostas comerciais do Partsec One e evolucao futura de pricing/PDF.

## Stack

- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- NextAuth com credenciais

## Como rodar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Configure o ambiente:

```bash
cp .env.example .env
```

3. Ajuste `DATABASE_URL` no `.env` para apontar para seu PostgreSQL.

4. Rode a migration e o seed:

```bash
npm run prisma:migrate
npm run db:seed
```

5. Suba o servidor:

```bash
npm run dev
```

Credenciais criadas pelo seed:

- Admin: `admin@partsec.com.br` / `admin123`
- Parceiro: `parceiro@partsec.com.br` / `parceiro123`

## Estrutura

- `app/`: rotas do App Router, login, dashboard e clientes.
- `components/`: componentes reutilizaveis de layout, UI e formularios.
- `lib/`: Prisma Client, Auth.js/NextAuth, actions e validacoes.
- `prisma/`: schema, migration inicial e seed.
- `types/`: augmentations de tipos, incluindo sessao NextAuth.
