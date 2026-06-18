#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public" ./scripts/backup-postgres.sh
#
# Optional:
#   BACKUP_DIR=/var/backups/partsec/postgres ./scripts/backup-postgres.sh

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required." >&2
  exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-./backups/postgres}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUTPUT_FILE="${BACKUP_DIR}/portal-comercial-partsec-${TIMESTAMP}.dump"

mkdir -p "${BACKUP_DIR}"

pg_dump "${DATABASE_URL}" --format=custom --no-owner --no-privileges --file="${OUTPUT_FILE}"

echo "PostgreSQL backup created: ${OUTPUT_FILE}"
