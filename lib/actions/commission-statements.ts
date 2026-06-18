"use server";

import {
  CommissionStatementDocumentType,
  CommissionStatus,
  PartnerCommissionStatementStatus,
  UserRole,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { type CommissionActionState } from "@/lib/actions/commissions";
import {
  getEffectivePartnerId,
  getRequiredSession,
  isPartnerAdmin,
  requireAdmin,
} from "@/lib/authz";
import {
  removeCommissionDocumentFile,
  saveCommissionDocumentFile,
  validatePdfFile,
  getAppBaseUrl,
} from "@/lib/commission-documents";
import { sendFinanceDocumentsEmail } from "@/lib/commission-statement-notifications";
import { sendMail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

function actionError(error: string): CommissionActionState {
  return {
    success: false,
    error,
  };
}

function actionSuccess(message: string): CommissionActionState {
  return {
    success: true,
    error: null,
    message,
  };
}

function parseDate(value: FormDataEntryValue | null, endOfDay = false) {
  if (typeof value !== "string" || !value) {
    return null;
  }

  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00"}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

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

function statementUrl(statementId: string) {
  return `${getAppBaseUrl()}/dashboard/comissoes/${statementId}`;
}

function buildStatementEmail({
  partnerName,
  referenceMonth,
  periodStart,
  periodEnd,
  totalAmount,
  commissionCount,
  url,
}: {
  partnerName: string;
  referenceMonth: string;
  periodStart: Date;
  periodEnd: Date;
  totalAmount: unknown;
  commissionCount: number;
  url: string;
}) {
  const total = formatCurrency(totalAmount);
  const period = `${formatDate(periodStart)} a ${formatDate(periodEnd)}`;
  const invoiceInstruction = `Emita a nota fiscal e o boleto no valor total de ${total} e, na descrição da nota fiscal, informe: "Comissionamento por representação comercial".`;

  return {
    subject: "Relatório mensal de comissões liberadas - Partsec",
    text: [
      `Olá, ${partnerName}.`,
      "",
      `As comissões liberadas para faturamento referentes ao mês ${referenceMonth} estão disponíveis no Portal Comercial Partsec.`,
      `Período considerado: ${period}.`,
      `Quantidade de comissões: ${commissionCount}.`,
      `Valor total liberado: ${total}.`,
      "",
      invoiceInstruction,
      "O pagamento será realizado após conferência dos documentos pelo financeiro da Partsec.",
      "",
      `Acesse o relatório: ${url}`,
      "",
      "Atenciosamente,",
      "Partsec",
    ].join("\n"),
    html: [
      '<div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:640px">',
      '<p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#2563eb;font-weight:700">Partsec</p>',
      '<h1 style="font-size:22px;margin:8px 0 16px">Relatório mensal de comissões liberadas</h1>',
      `<p>Olá, <strong>${partnerName}</strong>.</p>`,
      `<p>As comissões liberadas para faturamento referentes ao mês <strong>${referenceMonth}</strong> estão disponíveis no Portal Comercial Partsec.</p>`,
      `<p><strong>Período:</strong> ${period}<br/><strong>Comissões:</strong> ${commissionCount}<br/><strong>Total liberado:</strong> ${total}</p>`,
      `<p>${invoiceInstruction}</p>`,
      "<p>O pagamento será realizado após conferência dos documentos pelo financeiro da Partsec.</p>",
      `<p style="margin:24px 0"><a href="${url}" style="background:#0f172a;color:#ffffff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:700">Ver relatório</a></p>`,
      "<p>Se o botão não funcionar, copie e cole este link no navegador:</p>",
      `<p><a href="${url}" style="color:#2563eb">${url}</a></p>`,
      '<p style="margin-top:28px;color:#475569">Atenciosamente,<br/>Partsec</p>',
      "</div>",
    ].join(""),
  };
}

export async function createCommissionStatement(
  _state: CommissionActionState,
  formData: FormData
): Promise<CommissionActionState> {
  const session = await requireAdmin();

  const partnerId = String(formData.get("partnerId") || "").trim();
  const referenceMonth = String(formData.get("referenceMonth") || "").trim();
  const periodStart = parseDate(formData.get("periodStart"));
  const periodEnd = parseDate(formData.get("periodEnd"), true);
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!partnerId) {
    return actionError("Selecione um parceiro.");
  }

  if (!referenceMonth) {
    return actionError("Informe o mês de referência.");
  }

  if (!periodStart || !periodEnd) {
    return actionError("Informe o período do relatório.");
  }

  if (periodStart > periodEnd) {
    return actionError("A data inicial não pode ser maior que a final.");
  }

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: { id: true },
  });

  if (!partner) {
    return actionError("Parceiro não encontrado.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const commissions = await tx.partnerCommission.findMany({
      where: {
        partnerId,
        status: CommissionStatus.PENDING,
        releasedAt: {
          not: null,
          gte: periodStart,
          lte: periodEnd,
        },
        statementId: null,
      },
      select: {
        id: true,
        amount: true,
      },
    });

    if (commissions.length === 0) {
      return null;
    }

    const totalAmount = commissions.reduce(
      (total, commission) => total + Number(commission.amount),
      0
    );

    const statement = await tx.partnerCommissionStatement.create({
      data: {
        partnerId,
        referenceMonth,
        periodStart,
        periodEnd,
        totalAmount: totalAmount.toFixed(2),
        commissionCount: commissions.length,
        status: PartnerCommissionStatementStatus.DRAFT,
        notes,
        createdById: session.user.id,
      },
      select: { id: true },
    });

    await tx.partnerCommission.updateMany({
      where: {
        id: { in: commissions.map((commission) => commission.id) },
        statementId: null,
      },
      data: { statementId: statement.id },
    });

    return statement;
  });

  if (!result) {
    return actionError("Não há comissões liberadas para este parceiro/período.");
  }

  revalidatePath("/dashboard/financeiro/comissoes");
  revalidatePath("/dashboard/financeiro/comissoes/relatorios");
  redirect(`/dashboard/financeiro/comissoes/relatorios/${result.id}`);
}

export async function sendCommissionStatement(
  statementId: string,
  _state: CommissionActionState,
  _formData: FormData
): Promise<CommissionActionState> {
  const session = await requireAdmin();

  const statement = await prisma.partnerCommissionStatement.findUnique({
    where: { id: statementId },
    include: {
      partner: {
        select: {
          companyName: true,
          name: true,
          users: {
            where: {
              role: { in: [UserRole.PARTNER, UserRole.PARTNER_ADMIN] },
              isActive: true,
              deletedAt: null,
            },
            select: { email: true, name: true },
          },
        },
      },
    },
  });

  if (!statement) {
    return actionError("Relatório não encontrado.");
  }

  if (statement.status === PartnerCommissionStatementStatus.CANCELED) {
    return actionError("Relatório cancelado não pode ser enviado.");
  }

  if (statement.status !== PartnerCommissionStatementStatus.DRAFT) {
    return actionError("Apenas relatórios em rascunho podem ser enviados.");
  }

  const recipients = statement.partner.users;
  if (recipients.length === 0) {
    return actionError("O parceiro não possui Partner Admin ativo para receber o relatório.");
  }

  const partnerName = statement.partner.companyName || statement.partner.name;
  const url = statementUrl(statement.id);
  const email = buildStatementEmail({
    partnerName,
    referenceMonth: statement.referenceMonth,
    periodStart: statement.periodStart,
    periodEnd: statement.periodEnd,
    totalAmount: statement.totalAmount,
    commissionCount: statement.commissionCount,
    url,
  });

  const results = await Promise.all(
    recipients.map((recipient) =>
      sendMail({
        to: recipient.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      })
    )
  );
  const sentCount = results.filter((result) => result.sent).length;

  await prisma.partnerCommissionStatement.update({
    where: { id: statement.id },
    data: {
      status: PartnerCommissionStatementStatus.WAITING_DOCUMENTS,
      sentAt: new Date(),
      sentById: session.user.id,
    },
  });

  revalidatePath("/dashboard/financeiro/comissoes/relatorios");
  revalidatePath(`/dashboard/financeiro/comissoes/relatorios/${statement.id}`);
  revalidatePath("/dashboard/comissoes");
  revalidatePath(`/dashboard/comissoes/${statement.id}`);

  if (sentCount === 0) {
    console.info("Link do relatório de comissões:", url);
    return actionSuccess(
      `Relatório liberado no portal. SMTP não confirmou envio; link para teste: ${url}`
    );
  }

  return actionSuccess(
    `Relatório enviado para ${sentCount} destinatário${sentCount === 1 ? "" : "s"}.`
  );
}

export async function cancelCommissionStatement(
  statementId: string,
  _state: CommissionActionState,
  _formData: FormData
): Promise<CommissionActionState> {
  const session = await requireAdmin();

  const result = await prisma.$transaction(async (tx) => {
    const statement = await tx.partnerCommissionStatement.findUnique({
      where: { id: statementId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!statement) {
      return "NOT_FOUND" as const;
    }

    if (statement.status !== PartnerCommissionStatementStatus.DRAFT) {
      return "NOT_DRAFT" as const;
    }

    await tx.partnerCommissionStatement.update({
      where: { id: statement.id },
      data: {
        status: PartnerCommissionStatementStatus.CANCELED,
        canceledAt: new Date(),
        canceledById: session.user.id,
      },
    });

    await tx.partnerCommission.updateMany({
      where: { statementId: statement.id },
      data: { statementId: null },
    });

    return "OK" as const;
  });

  if (result === "NOT_FOUND") return actionError("Relatório não encontrado.");
  if (result === "NOT_DRAFT") {
    return actionError("Apenas relatórios em rascunho podem ser cancelados.");
  }

  revalidatePath("/dashboard/financeiro/comissoes");
  revalidatePath("/dashboard/financeiro/comissoes/relatorios");
  revalidatePath(`/dashboard/financeiro/comissoes/relatorios/${statementId}`);
  return actionSuccess("Relatório cancelado. Comissões voltaram a ficar disponíveis.");
}

export async function uploadCommissionStatementDocuments(
  statementId: string,
  _state: CommissionActionState,
  formData: FormData
): Promise<CommissionActionState> {
  const session = await getRequiredSession();

  if (!isPartnerAdmin(session)) {
    return actionError("Você não tem permissão para enviar documentos.");
  }

  const partnerId = getEffectivePartnerId(session);
  if (!partnerId) {
    return actionError("Usuário parceiro sem vínculo de parceiro.");
  }

  const statement = await prisma.partnerCommissionStatement.findFirst({
    where: { id: statementId, partnerId },
    include: {
      documents: {
        select: {
          id: true,
          type: true,
          storagePath: true,
        },
      },
    },
  });

  if (!statement) {
    return actionError("Relatório não encontrado.");
  }

  if (statement.status === PartnerCommissionStatementStatus.CANCELED) {
    return actionError("Relatório cancelado não aceita envio de documentos.");
  }

  if (statement.status === PartnerCommissionStatementStatus.DRAFT) {
    return actionError("Relatório em rascunho ainda não aceita envio de documentos.");
  }

  if (
    statement.status !== PartnerCommissionStatementStatus.SENT &&
    statement.status !== PartnerCommissionStatementStatus.WAITING_DOCUMENTS &&
    statement.status !== PartnerCommissionStatementStatus.DOCUMENTS_RECEIVED
  ) {
    return actionError("Status do relatório não permite envio de documentos.");
  }

  const invoice = formData.get("invoice");
  const bankSlip = formData.get("bankSlip");

  if (!(invoice instanceof File)) {
    return actionError("Envie a nota fiscal em PDF.");
  }

  if (!(bankSlip instanceof File)) {
    return actionError("Envie o boleto em PDF.");
  }

  const invoiceError = validatePdfFile(invoice, "a nota fiscal");
  if (invoiceError) return actionError(invoiceError);

  const bankSlipError = validatePdfFile(bankSlip, "o boleto");
  if (bankSlipError) return actionError(bankSlipError);

  let savedInvoice;
  let savedBankSlip;

  try {
    savedInvoice = await saveCommissionDocumentFile({
      file: invoice,
      statementId: statement.id,
      type: CommissionStatementDocumentType.INVOICE,
    });
    savedBankSlip = await saveCommissionDocumentFile({
      file: bankSlip,
      statementId: statement.id,
      type: CommissionStatementDocumentType.BANK_SLIP,
    });
  } catch (error) {
    console.error("Falha ao salvar documentos de comissão:", error);
    return actionError("Não foi possível salvar os documentos. Tente novamente.");
  }

  const previousInvoice = statement.documents.find(
    (document) => document.type === CommissionStatementDocumentType.INVOICE
  );
  const previousBankSlip = statement.documents.find(
    (document) => document.type === CommissionStatementDocumentType.BANK_SLIP
  );

  await prisma.$transaction(async (tx) => {
    await tx.partnerCommissionStatementDocument.upsert({
      where: {
        statementId_type: {
          statementId: statement.id,
          type: CommissionStatementDocumentType.INVOICE,
        },
      },
      create: {
        statementId: statement.id,
        type: CommissionStatementDocumentType.INVOICE,
        ...savedInvoice,
        uploadedById: session.user.id,
      },
      update: {
        ...savedInvoice,
        uploadedById: session.user.id,
        uploadedAt: new Date(),
      },
    });

    await tx.partnerCommissionStatementDocument.upsert({
      where: {
        statementId_type: {
          statementId: statement.id,
          type: CommissionStatementDocumentType.BANK_SLIP,
        },
      },
      create: {
        statementId: statement.id,
        type: CommissionStatementDocumentType.BANK_SLIP,
        ...savedBankSlip,
        uploadedById: session.user.id,
      },
      update: {
        ...savedBankSlip,
        uploadedById: session.user.id,
        uploadedAt: new Date(),
      },
    });

    await tx.partnerCommissionStatement.update({
      where: { id: statement.id },
      data: {
        status: PartnerCommissionStatementStatus.DOCUMENTS_RECEIVED,
        documentsReceivedAt: new Date(),
        documentsReceivedById: session.user.id,
        documentsNotes: String(formData.get("documentsNotes") || "").trim() || null,
      },
    });
  });

  await Promise.all([
    removeCommissionDocumentFile(previousInvoice?.storagePath),
    removeCommissionDocumentFile(previousBankSlip?.storagePath),
  ]);

  const emailResult = await sendFinanceDocumentsEmail(statement.id);

  if (emailResult.sent) {
    await prisma.partnerCommissionStatement.update({
      where: { id: statement.id },
      data: {
        financeEmailSentAt: new Date(),
        financeEmailSentTo: emailResult.to,
      },
    });
  }

  revalidatePath("/dashboard/comissoes");
  revalidatePath(`/dashboard/comissoes/${statement.id}`);
  revalidatePath("/dashboard/financeiro/comissoes/relatorios");
  revalidatePath(`/dashboard/financeiro/comissoes/relatorios/${statement.id}`);

  if (!emailResult.sent) {
    return actionSuccess(
      "Documentos recebidos, mas houve falha ao enviar o e-mail ao financeiro. Tente reenviar a notificação pelo painel administrativo."
    );
  }

  return actionSuccess("Documentos recebidos e e-mail enviado ao financeiro.");
}

export async function resendCommissionDocumentsToFinance(
  statementId: string,
  _state: CommissionActionState,
  _formData: FormData
): Promise<CommissionActionState> {
  await requireAdmin();

  const statement = await prisma.partnerCommissionStatement.findUnique({
    where: { id: statementId },
    include: {
      documents: { select: { id: true } },
    },
  });

  if (!statement) {
    return actionError("Relatório não encontrado.");
  }

  if (statement.status === PartnerCommissionStatementStatus.CANCELED) {
    return actionError("Relatório cancelado não permite reenvio ao financeiro.");
  }

  if (statement.documents.length < 2 || !statement.documentsReceivedAt) {
    return actionError("Relatório ainda não possui nota fiscal e boleto recebidos.");
  }

  const emailResult = await sendFinanceDocumentsEmail(statement.id);

  if (!emailResult.sent) {
    return actionError("Falha ao enviar e-mail ao financeiro. Tente novamente.");
  }

  await prisma.partnerCommissionStatement.update({
    where: { id: statement.id },
    data: {
      financeEmailSentAt: new Date(),
      financeEmailSentTo: emailResult.to,
    },
  });

  revalidatePath(`/dashboard/financeiro/comissoes/relatorios/${statement.id}`);
  return actionSuccess("E-mail reenviado ao financeiro.");
}
