import { readFile } from "node:fs/promises";

import { CommissionStatementDocumentType } from "@prisma/client";

import {
  documentDownloadPath,
  documentTypeLabel,
  getFinanceEmail,
} from "@/lib/commission-documents";
import { sendMail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value ?? 0));
}

function formatDate(value: Date | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(value);
}

function getAppBaseUrl() {
  return (
    process.env.NEXTAUTH_URL ??
    process.env.APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function adminStatementUrl(statementId: string) {
  return `${getAppBaseUrl()}/dashboard/financeiro/comissoes/relatorios/${statementId}`;
}

export type FinanceEmailResult = {
  sent: boolean;
  to: string;
  error?: string;
};

export async function sendFinanceDocumentsEmail(
  statementId: string
): Promise<FinanceEmailResult> {
  const to = getFinanceEmail();
  const statement = await prisma.partnerCommissionStatement.findUnique({
    where: { id: statementId },
    include: {
      partner: { select: { companyName: true, name: true } },
      documentsReceivedBy: { select: { name: true, email: true } },
      documents: {
        orderBy: { type: "asc" },
        select: {
          id: true,
          type: true,
          originalFileName: true,
          storagePath: true,
        },
      },
    },
  });

  if (!statement) {
    return { sent: false, to, error: "Relatório não encontrado." };
  }

  const invoice = statement.documents.find(
    (document) => document.type === CommissionStatementDocumentType.INVOICE
  );
  const bankSlip = statement.documents.find(
    (document) => document.type === CommissionStatementDocumentType.BANK_SLIP
  );

  if (!invoice || !bankSlip) {
    return {
      sent: false,
      to,
      error: "Relatório ainda não possui nota fiscal e boleto recebidos.",
    };
  }

  try {
    await Promise.all([readFile(invoice.storagePath), readFile(bankSlip.storagePath)]);
  } catch {
    return {
      sent: false,
      to,
      error: "Um ou mais arquivos não foram encontrados no storage.",
    };
  }

  const partnerName = statement.partner.companyName || statement.partner.name;
  const total = formatCurrency(statement.totalAmount);
  const period = `${formatDate(statement.periodStart)} a ${formatDate(statement.periodEnd)}`;
  const adminUrl = adminStatementUrl(statement.id);
  const documentLines = statement.documents.map((document) => {
    const downloadUrl = `${getAppBaseUrl()}${documentDownloadPath(document.id)}`;
    return `${documentTypeLabel(document.type)}: ${document.originalFileName} - ${downloadUrl}`;
  });
  const htmlDocumentLines = statement.documents
    .map((document) => {
      const downloadUrl = `${getAppBaseUrl()}${documentDownloadPath(document.id)}`;
      return `<li>${documentTypeLabel(document.type)}: <a href="${downloadUrl}" style="color:#2563eb">${document.originalFileName}</a></li>`;
    })
    .join("");

  const result = await sendMail({
    to,
    subject: `Documentos de comissão recebidos - ${partnerName} - ${statement.referenceMonth}`,
    text: [
      "Documentos de comissão recebidos.",
      "",
      `Parceiro: ${partnerName}`,
      `Mês de referência: ${statement.referenceMonth}`,
      `Período: ${period}`,
      `Valor total: ${total}`,
      `Quantidade de comissões: ${statement.commissionCount}`,
      `Enviado por: ${
        statement.documentsReceivedBy
          ? statement.documentsReceivedBy.name || statement.documentsReceivedBy.email
          : "-"
      }`,
      "",
      "Documentos:",
      ...documentLines,
      "",
      `Detalhe administrativo: ${adminUrl}`,
      "",
      "Partsec",
    ].join("\n"),
    html: [
      '<div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:640px">',
      '<p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;font-weight:700">Partsec</p>',
      '<h1 style="font-size:22px;margin:8px 0 16px">Documentos de comissão recebidos</h1>',
      `<p><strong>Parceiro:</strong> ${partnerName}<br/><strong>Mês:</strong> ${statement.referenceMonth}<br/><strong>Período:</strong> ${period}<br/><strong>Total:</strong> ${total}<br/><strong>Comissões:</strong> ${statement.commissionCount}</p>`,
      `<p><strong>Enviado por:</strong> ${
        statement.documentsReceivedBy
          ? statement.documentsReceivedBy.name || statement.documentsReceivedBy.email
          : "-"
      }</p>`,
      `<ul>${htmlDocumentLines}</ul>`,
      `<p><a href="${adminUrl}" style="color:#2563eb">Abrir detalhe administrativo do relatório</a></p>`,
      '<p style="margin-top:28px;color:#475569">Partsec</p>',
      "</div>",
    ].join(""),
  });

  return {
    sent: result.sent,
    to,
    error: result.sent ? undefined : result.reason || "Falha no envio SMTP.",
  };
}
