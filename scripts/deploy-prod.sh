#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/portal-comercial-partsec"
APP_NAME="portal-comercial"

cd "$APP_DIR"

echo "==> Portal Comercial Partsec - Deploy de produção"
echo "==> Diretório: $APP_DIR"
echo "==> App PM2: $APP_NAME"

echo "==> Conferindo working tree"
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Existem alterações locais não commitadas. Abortando deploy por segurança."
  git status --short
  exit 1
fi

echo "==> Criando backup do banco antes do deploy"
if [ -f scripts/backup-db.sh ]; then
  bash scripts/backup-db.sh
else
  echo "scripts/backup-db.sh não encontrado. Abortando deploy por segurança."
  exit 1
fi

echo "==> Criando backup dos documentos de comissão"
if [ -f scripts/backup-commission-documents.sh ]; then
  bash scripts/backup-commission-documents.sh
else
  echo "scripts/backup-commission-documents.sh não encontrado. Pulando backup dos documentos."
fi

echo "==> Atualizando código"
git fetch origin
git pull --ff-only origin main

echo "==> Instalando dependências"
npm ci --include=dev

echo "==> Corrigindo permissões dos engines Prisma"
chmod +x node_modules/@prisma/engines/* 2>/dev/null || true
chmod +x node_modules/.prisma/client/* 2>/dev/null || true

echo "==> Validando ambiente"
if [ -f scripts/check-env.ts ]; then
  npx tsx scripts/check-env.ts
else
  echo "scripts/check-env.ts não encontrado. Pulando validação."
fi

echo "==> Gerando Prisma Client"
npx prisma generate

echo "==> Aplicando migrations"
npx prisma migrate deploy

echo "==> Atualizando tabela de preços, se habilitado"
if [ "${DEPLOY_UPDATE_PRICING:-0}" = "1" ]; then
  if npm run | grep -q "pricing:update"; then
    npm run pricing:update
  else
    echo "Script pricing:update não encontrado. Pulando."
  fi
else
  echo "DEPLOY_UPDATE_PRICING não está habilitado. Pulando atualização de preços."
fi

echo "==> Build"
npm run build

echo "==> Reiniciando PM2"
pm2 restart "$APP_NAME" --update-env
pm2 save

echo "==> Status PM2"
pm2 status "$APP_NAME"

echo "==> Healthcheck local"
if command -v curl >/dev/null 2>&1; then
  curl -fsS http://localhost:3000/api/health || {
    echo "Healthcheck local falhou."
    exit 1
  }
else
  echo "curl não encontrado. Pulando healthcheck."
fi

echo "Deploy concluído com sucesso."
