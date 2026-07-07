import { notFound } from "next/navigation";

import { AssessmentActions } from "@/components/assessments/assessment-actions";
import { AssessmentAnswers } from "@/components/assessments/assessment-answers";
import { CopyAssessmentLinkButton } from "@/components/assessments/copy-assessment-link-button";
import { assessmentScopeWhere } from "@/lib/assessments/access";
import {
  ASSESSMENT_STATUS_LABELS,
  ASSESSMENT_TYPE_LABELS,
  getAssessmentStatusBadgeClasses,
} from "@/lib/assessments/catalog";
import {
  buildAssessmentToken,
  getAssessmentPublicUrl,
} from "@/lib/assessments/tokens";
import {
  canManageAssessmentLink,
  getRequiredSession,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";

function formatDateTime(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default async function AssessmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getRequiredSession();
  const { id } = await params;

  const assessment = await prisma.assessment.findFirst({
    where: {
      id,
      ...assessmentScopeWhere(session),
    },
    include: {
      customer: true,
      partner: true,
      createdBy: { select: { name: true, email: true } },
    },
  });

  if (!assessment) {
    notFound();
  }

  const canManage = canManageAssessmentLink(session);
  const publicToken = assessment.tokenNonce
    ? buildAssessmentToken(assessment.id, assessment.tokenNonce)
    : null;
  const publicUrl = publicToken ? getAssessmentPublicUrl(publicToken) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            {assessment.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Levantamento técnico de {assessment.customer.companyName}.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {publicUrl ? <CopyAssessmentLinkButton publicUrl={publicUrl} /> : null}
          <AssessmentActions
            assessmentId={assessment.id}
            canManage={canManage}
            isSubmitted={assessment.status === "SUBMITTED"}
            isCancelled={assessment.status === "CANCELLED"}
          />
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cliente
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {assessment.customer.companyName}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Parceiro
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {assessment.partner?.companyName ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </p>
            <span
              className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getAssessmentStatusBadgeClasses(
                assessment.status
              )}`}
            >
              {ASSESSMENT_STATUS_LABELS[assessment.status]}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tipo
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {ASSESSMENT_TYPE_LABELS[assessment.type]}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Validade
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {formatDateTime(assessment.tokenExpiresAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Primeiro acesso
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {formatDateTime(assessment.firstAccessedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Submissão
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {formatDateTime(assessment.submittedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Responsável
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {assessment.submittedByName ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Contato
            </p>
            <p className="mt-1 text-sm text-slate-900">
              {[assessment.submittedByEmail, assessment.submittedByPhone]
                .filter(Boolean)
                .join(" | ") || "-"}
            </p>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Link público
          </p>
          <p className="mt-1 break-all text-sm text-slate-800">
            {publicUrl ?? "Sem link ativo. Gere um novo link para este assessment."}
          </p>
        </div>

        {assessment.internalNotes ? (
          <div className="mt-5 border-t border-slate-200 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Observações internas
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
              {assessment.internalNotes}
            </p>
          </div>
        ) : null}
      </section>

      {assessment.answers ? (
        <AssessmentAnswers answers={assessment.answers} />
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Ainda não há respostas submetidas para este assessment.
        </div>
      )}
    </div>
  );
}
