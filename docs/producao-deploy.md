# Deploy em Producao

Este guia descreve uma instalacao Linux para o Portal Comercial Partsec usando Node.js, PostgreSQL, PM2 e Nginx.

## 1. Arquitetura sugerida
- Next.js rodando em Node.js com `next start`.
- PostgreSQL dedicado para dados da aplicacao.
- Nginx como reverse proxy HTTP/HTTPS.
- PM2 para manter o processo Node em execucao.
- Diretorio persistente privado para documentos de comissao.
- SMTP Zoho para convites, relatorios e notificacoes financeiras.
- Backups separados do banco PostgreSQL e do diretorio de documentos.

## 2. Requisitos do servidor
- Ubuntu Server LTS.
- Node.js LTS.
- npm.
- PostgreSQL.
- Nginx.
- PM2 instalado globalmente.
- Git.
- Certbot/Let's Encrypt, se HTTPS for emitido no proprio servidor.

Exemplo de pacotes:

```bash
sudo apt update
sudo apt install -y git nginx postgresql postgresql-client certbot python3-certbot-nginx
npm install -g pm2
```

Instale Node.js LTS pelo metodo padrao da sua operacao, como NodeSource, nvm ou pacote corporativo.

## 3. Variaveis de ambiente
Use `.env.production.example` como base e crie `.env` no servidor, sem commitar segredos.

Variaveis esperadas:
- `NODE_ENV=production`
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `APP_URL`
- `NEXT_PUBLIC_APP_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_FROM_NAME`
- `FINANCE_EMAIL`
- `COMMISSION_DOCUMENTS_DIR`

`APP_URL`, `NEXT_PUBLIC_APP_URL` e `NEXTAUTH_URL` devem apontar para a URL publica HTTPS do portal.

## 4. Build
No diretorio do projeto:

```bash
npm ci
npm run prod:build
```

O script `prod:build` executa `prisma generate` e `next build`.

## 5. Migrations em producao
Em producao, use sempre:

```bash
npm run prod:migrate
```

Isto executa `prisma migrate deploy`.

Nao use `prisma migrate dev` em producao.

## 6. PM2
O arquivo `ecosystem.config.cjs` define o app `partsec-portal-comercial`.

Start:

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

Restart apos novo deploy:

```bash
pm2 restart partsec-portal-comercial
```

Logs:

```bash
pm2 logs partsec-portal-comercial
pm2 status
```

Para iniciar no boot:

```bash
pm2 startup
pm2 save
```

## 7. Nginx
Use `deploy/nginx/portal-comercial-partsec.conf.example` como base.

Exemplo:

```bash
sudo cp deploy/nginx/portal-comercial-partsec.conf.example /etc/nginx/sites-available/portal-comercial-partsec
sudo ln -s /etc/nginx/sites-available/portal-comercial-partsec /etc/nginx/sites-enabled/portal-comercial-partsec
sudo nginx -t
sudo systemctl reload nginx
```

Ajuste `server_name` para o dominio real.

O exemplo usa:
- `proxy_pass http://127.0.0.1:3000`
- headers `X-Forwarded-*`
- `client_max_body_size 20M` para upload de NF/boleto.

## 8. HTTPS
Com Certbot:

```bash
sudo certbot --nginx -d portal.example.com
```

Depois ajuste:
- `NEXTAUTH_URL=https://portal.example.com`
- `APP_URL=https://portal.example.com`
- `NEXT_PUBLIC_APP_URL=https://portal.example.com`

## 9. Storage persistente de documentos
Documentos de comissao nao devem ficar em `/public`.

Diretorio recomendado:

```bash
sudo mkdir -p /var/lib/partsec/portal-comercial/commission-documents
sudo chown -R nodeuser:nodeuser /var/lib/partsec/portal-comercial
sudo chmod -R 750 /var/lib/partsec/portal-comercial
```

Configure:

```bash
COMMISSION_DOCUMENTS_DIR=/var/lib/partsec/portal-comercial/commission-documents
```

Use um volume persistente em ambientes cloud.

## 10. Permissoes de filesystem
O usuario que executa o PM2 precisa:
- criar subdiretorios no `COMMISSION_DOCUMENTS_DIR`;
- escrever PDFs enviados;
- ler PDFs para download e notificacao ao financeiro.

O Nginx nao deve servir o diretorio de documentos diretamente.

## 11. Backup e restore

### Banco
Backup:

```bash
DATABASE_URL="postgresql://..." BACKUP_DIR=/var/backups/partsec/postgres ./scripts/backup-postgres.sh
```

Restore em ambiente controlado:

```bash
pg_restore --dbname="postgresql://..." --clean --if-exists arquivo.dump
```

### Documentos
Backup:

```bash
COMMISSION_DOCUMENTS_DIR=/var/lib/partsec/portal-comercial/commission-documents BACKUP_DIR=/var/backups/partsec/documents ./scripts/backup-commission-documents.sh
```

Restore:

```bash
sudo tar -xzf commission-documents-YYYYMMDD-HHMMSS.tar.gz -C /var/lib/partsec/portal-comercial
sudo chown -R nodeuser:nodeuser /var/lib/partsec/portal-comercial/commission-documents
```

Banco e documentos devem ser restaurados de backups compatíveis no tempo.

## 12. Checklist de deploy
- Revisar `.env` de producao.
- Garantir `DATABASE_URL` correto.
- Garantir `NEXTAUTH_SECRET` forte.
- Criar diretorio persistente de documentos.
- Rodar `npm ci`.
- Rodar `npm run prod:migrate`.
- Rodar `npm run prod:build`.
- Iniciar ou reiniciar PM2.
- Validar Nginx com `nginx -t`.
- Validar HTTPS.
- Testar `/api/health`.

## 13. Checklist de rollback
- Identificar release anterior.
- Parar ou reiniciar PM2 para a versao anterior.
- Restaurar backup do banco, se migration precisar ser revertida.
- Restaurar backup de documentos correspondente, se necessario.
- Rodar `npm ci` e `npm run prod:build` na versao anterior.
- Validar login, dashboard e fluxo de documentos.

## 14. Checklist pos-deploy
- `GET /api/health` retorna `status: ok`.
- Login ADMIN funciona.
- Login de parceiro funciona.
- Area financeira ADMIN abre.
- Area de comissoes do parceiro abre.
- Upload de NF/boleto funciona.
- Download seguro funciona.
- E-mail SMTP funciona.
- PM2 sem restarts inesperados.
- Nginx sem erros 5xx.
- Espaco em disco adequado.

## 15. Observacao operacional
Para producao com maior volume ou requisitos de compliance, avaliar migrar documentos para Object Storage, como S3, OCI Object Storage ou equivalente, com versionamento, criptografia, lifecycle policy e backup independente.
