import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { CommissionStatementDocumentType } from "@prisma/client";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const PDF_MIME_TYPES = new Set(["application/pdf", "application/x-pdf"]);

export type SavedCommissionDocument = {
  originalFileName: string;
  storedFileName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
};

export function getCommissionDocumentsBaseDir() {
  const configuredDir = process.env.COMMISSION_DOCUMENTS_DIR;
  if (configuredDir) {
    return path.resolve(configuredDir);
  }

  return path.join(process.cwd(), "storage", "commission-documents");
}

export function getFinanceEmail() {
  return process.env.FINANCE_EMAIL || "financeiro@partsec.com.br";
}

export function documentTypeLabel(type: CommissionStatementDocumentType) {
  return type === CommissionStatementDocumentType.INVOICE
    ? "Nota fiscal"
    : "Boleto";
}

export function documentDownloadPath(documentId: string) {
  return `/api/comissoes/documentos/${documentId}/download`;
}

export function validatePdfFile(file: File, label: string) {
  if (!file || file.size === 0) {
    return `Envie ${label} em PDF.`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "O arquivo excede o limite de 10 MB.";
  }

  if (!PDF_MIME_TYPES.has(file.type)) {
    return `Envie ${label} em PDF.`;
  }

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return `Envie ${label} em PDF.`;
  }

  return null;
}

export async function saveCommissionDocumentFile({
  file,
  statementId,
  type,
}: {
  file: File;
  statementId: string;
  type: CommissionStatementDocumentType;
}): Promise<SavedCommissionDocument> {
  const baseDir = getCommissionDocumentsBaseDir();
  const statementDir = path.join(baseDir, statementId);
  await mkdir(statementDir, { recursive: true });

  const storedFileName = `${type.toLowerCase()}-${randomUUID()}.pdf`;
  const storagePath = path.join(statementDir, storedFileName);
  const normalizedPath = path.normalize(storagePath);

  if (!normalizedPath.startsWith(statementDir)) {
    throw new Error("Caminho de documento inválido.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(normalizedPath, bytes);

  return {
    originalFileName: file.name,
    storedFileName,
    storagePath: normalizedPath,
    mimeType: file.type || "application/pdf",
    sizeBytes: file.size,
  };
}

export async function removeCommissionDocumentFile(storagePath: string | null | undefined) {
  if (!storagePath) return;

  try {
    await unlink(storagePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Falha ao remover documento antigo:", error);
    }
  }
}
