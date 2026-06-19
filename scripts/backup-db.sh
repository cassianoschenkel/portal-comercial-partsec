#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/portal-comercial-partsec"
BACKUP_BASE_DIR="${BACKUP_BASE_DIR:-/var/backups/partsec/portal-comercial}"

cd "$APP_DIR"

if [ ! -f .env ]; then
  echo ".env não encontrado em $APP_DIR"
  exit 1
fi

set -a
source .env
set +a

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL não definida."
  exit 1
fi

BACKUP_DIR="$BACKUP_BASE_DIR/$(date +%F_%H%M%S)"
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/portal-comercial-db.sql"

echo "==> Gerando backup PostgreSQL em:"
echo "$BACKUP_FILE"

pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

gzip "$BACKUP_FILE"

echo "Backup do banco concluído:"
ls -lh "$BACKUP_FILE.gz"
