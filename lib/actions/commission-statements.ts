"use server";

import {
  CommissionStatus,
  PartnerCommissionStatementStatus,
  UserRole,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { type CommissionActionState } from "@/lib/actions/commissions";
import { requireAdmin } from "@/lib/authz";
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

function getAppBaseUrl() {
  return (
    process.env.NEXTAUTH_URL ??
    process.env.APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
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
      "Para prosseguirmos com o pagamento, envie pelo portal a nota fiscal e o boleto correspondente ao valor total liberado.",
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
      "<p>Para prosseguirmos com o pagamento, envie pelo portal a nota fiscal e o boleto correspondente ao valor total liberado.</p>",
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
