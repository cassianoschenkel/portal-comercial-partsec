import { AssessmentStatus } from "@prisma/client";

import { PublicAssessmentForm } from "@/components/assessments/public-assessment-form";
import {
  hashAssessmentToken,
  isWellFormedAssessmentToken,
} from "@/lib/assessments/tokens";
import { prisma } from "@/lib/prisma";

function PublicMessage({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Levantamento Técnico
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-3 text-sm text-slate-600">{message}</p>
      </div>
    </main>
  );
}

export default async function PublicAssessmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;

  if (!isWellFormedAssessmentToken(token)) {
    return (
      <PublicMessage
        title="Link inválido"
        message="Não foi possível localizar este levantamento técnico."
      />
    );
  }

  const assessment = await prisma.assessment.findUnique({
    where: { tokenHash: hashAssessmentToken(token) },
    select: {
      id: true,
      title: true,
      status: true,
      tokenExpiresAt: true,
      firstAccessedAt: true,
      submittedAt: true,
      customer: {
        select: {
          companyName: true,
          tradeName: true,
        },
      },
    },
  });

  if (!assessment) {
    return (
      <PublicMessage
        title="Link inválido"
        message="Não foi possível localizar este levantamento técnico."
      />
    );
  }

  if (assessment.status === AssessmentStatus.CANCELLED) {
    return (
      <PublicMessage
        title="Levantamento indisponível"
        message="Este levantamento técnico foi cancelado. Solicite um novo link ao responsável pelo atendimento."
      />
    );
  }

  if (
    assessment.status === AssessmentStatus.EXPIRED ||
    (assessment.tokenExpiresAt && assessment.tokenExpiresAt < new Date())
  ) {
    if (assessment.status !== AssessmentStatus.EXPIRED) {
      await prisma.assessment.update({
        where: { id: assessment.id },
        data: { status: AssessmentStatus.EXPIRED },
      });
    }

    return (
      <PublicMessage
        title="Link expirado"
        message="Este link de levantamento técnico expirou. Solicite um novo link ao responsável pelo atendimento."
      />
    );
  }

  if (assessment.status === AssessmentStatus.SUBMITTED || query.submitted) {
    return (
      <PublicMessage
        title="Levantamento enviado"
        message="Obrigado. As respostas foram recebidas e serão analisadas pela equipe responsável."
      />
    );
  }

  if (
    assessment.status === AssessmentStatus.DRAFT ||
    assessment.status === AssessmentStatus.SENT
  ) {
    await prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        status: AssessmentStatus.IN_PROGRESS,
        firstAccessedAt: assessment.firstAccessedAt ?? new Date(),
      },
    });
  }

  const customerName =
    assessment.customer.tradeName || assessment.customer.companyName;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Levantamento Técnico
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            {assessment.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{customerName}</p>
        </header>

        <PublicAssessmentForm token={token} />
      </div>
    </main>
  );
}
