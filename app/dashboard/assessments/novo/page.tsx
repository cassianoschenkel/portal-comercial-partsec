import { redirect } from "next/navigation";

import { AssessmentForm } from "@/components/assessments/assessment-form";
import { createAssessment } from "@/lib/actions/assessments";
import { assessmentScopeWhere } from "@/lib/assessments/access";
import { getRequiredSession, requireCanCreateAssessment } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function NewAssessmentPage() {
  const session = await getRequiredSession();
  requireCanCreateAssessment(session);

  const customers = await prisma.customer.findMany({
    where: assessmentScopeWhere(session),
    select: {
      id: true,
      companyName: true,
      tradeName: true,
    },
    orderBy: {
      companyName: "asc",
    },
  });

  if (customers.length === 0) {
    redirect("/dashboard/clientes/novo");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">
          Novo assessment
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Gere um link público para o cliente preencher o levantamento técnico.
        </p>
      </div>

      <AssessmentForm customers={customers} action={createAssessment} />
    </div>
  );
}
