import { readFile } from "node:fs/promises";

import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

import {
  getEffectivePartnerId,
  getRequiredSession,
  isPartnerAdmin,
} from "@/lib/authz";
import { resolveCommissionDocumentStoragePath } from "@/lib/commission-documents";
import { prisma } from "@/lib/prisma";

function contentDispositionFileName(fileName: string) {
  return fileName.replace(/["\r\n]/g, "_");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await getRequiredSession();
  const { documentId } = await params;

  const document = await prisma.partnerCommissionStatementDocument.findUnique({
    where: { id: documentId },
    include: {
      statement: {
        select: {
          partnerId: true,
        },
      },
    },
  });

  if (!document) {
    notFound();
  }

  const isAdmin = session.user.role === UserRole.ADMIN;
  const canAccessAsPartner =
    isPartnerAdmin(session) &&
    getEffectivePartnerId(session) === document.statement.partnerId;

  if (!isAdmin && !canAccessAsPartner) {
    notFound();
  }

  const storagePath = resolveCommissionDocumentStoragePath(document.storagePath);
  if (!storagePath) {
    notFound();
  }

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(storagePath);
  } catch {
    notFound();
  }

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": document.mimeType,
      "Content-Disposition": `attachment; filename="${contentDispositionFileName(
        document.originalFileName
      )}"`,
      "Content-Length": String(document.sizeBytes),
    },
  });
}
