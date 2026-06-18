#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   COMMISSION_DOCUMENTS_DIR=/var/lib/partsec/portal-comercial/commission-documents ./scripts/backup-commission-documents.sh
#
# Optional:
#   BACKUP_DIR=/var/backups/partsec/documents ./scripts/backup-commission-documents.sh

DOCUMENTS_DIR="${COMMISSION_DOCUMENTS_DIR:-./storage/commission-documents}"
BACKUP_DIR="${BACKUP_DIR:-./backups/commission-documents}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUTPUT_FILE="${BACKUP_DIR}/commission-documents-${TIMESTAMP}.tar.gz"

if [[ ! -d "${DOCUMENTS_DIR}" ]]; then
  echo "Documents directory not found: ${DOCUMENTS_DIR}" >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

tar -czf "${OUTPUT_FILE}" -C "$(dirname "${DOCUMENTS_DIR}")" "$(basename "${DOCUMENTS_DIR}")"

echo "Commission documents backup created: ${OUTPUT_FILE}"
