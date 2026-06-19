#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/portal-comercial-partsec"
BACKUP_BASE_DIR="${BACKUP_BASE_DIR:-/var/backups/partsec/portal-comercial}"

cd "$APP_DIR"

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

DOCUMENTS_DIR="${COMMISSION_DOCUMENTS_DIR:-/var/lib/partsec/portal-comercial/commission-documents}"

if [ ! -d "$DOCUMENTS_DIR" ]; then
  echo "Diretório de documentos não encontrado: $DOCUMENTS_DIR"
  echo "Nada para backup."
  exit 0
fi

BACKUP_DIR="$BACKUP_BASE_DIR/$(date +%F_%H%M%S)"
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/commission-documents.tar.gz"

echo "==> Gerando backup dos documentos em:"
echo "$BACKUP_FILE"

tar -czf "$BACKUP_FILE" -C "$(dirname "$DOCUMENTS_DIR")" "$(basename "$DOCUMENTS_DIR")"

echo "Backup dos documentos concluído:"
ls -lh "$BACKUP_FILE"
