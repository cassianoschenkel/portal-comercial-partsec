import Link from "next/link";
import { AssessmentStatus, AssessmentType } from "@prisma/client";

import { AssessmentsTable } from "@/components/assessments/assessments-table";
import { assessmentScopeWhere } from "@/lib/assessments/access";
import {
  ASSESSMENT_STATUS_LABELS,
  ASSESSMENT_TYPE_LABELS,
} from "@/lib/assessments/catalog";
import { canCreateAssessment, getRequiredSession } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export default async function AssessmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    type?: string;
    customerId?: string;
  }>;
}) {
  const session = await getRequiredSession();
  const params = await searchParams;
  const canCreate = canCreateAssessment(session);

  const status = Object.values(AssessmentStatus).includes(
    params.status as AssessmentStatus
  )
    ? (params.status as AssessmentStatus)
    : undefined;
  const type = Object.values(AssessmentType).includes(params.type as AssessmentType)
    ? (params.type as AssessmentType)
    : undefined;

  const customers = await prisma.customer.findMany({
    where: assessmentScopeWhere(session),
    select: { id: true, companyName: true },
    orderBy: { companyName: "asc" },
  });

  const assessments = await prisma.assessment.findMany({
    where: {
      ...assessmentScopeWhere(session),
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
      ...(params.customerId ? { customerId: params.customerId } : {}),
    },
    include: {
      customer: { select: { companyName: true } },
      partner: { select: { companyName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Assessments
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Gerencie levantamentos técnicos enviados a clientes e prospects.
          </p>
        </div>

        {canCreate ? (
          <Link
            href="/dashboard/assessments/novo"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Novo assessment
          </Link>
        ) : null}
      </div>

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          {Object.values(AssessmentStatus).map((item) => (
            <option key={item} value={item}>
              {ASSESSMENT_STATUS_LABELS[item]}
            </option>
          ))}
        </select>

        <select
          name="type"
          defaultValue={type ?? ""}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todos os tipos</option>
          {Object.values(AssessmentType).map((item) => (
            <option key={item} value={item}>
              {ASSESSMENT_TYPE_LABELS[item]}
            </option>
          ))}
        </select>

        <select
          name="customerId"
          defaultValue={params.customerId ?? ""}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todos os clientes</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.companyName}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Filtrar
        </button>
      </form>

      <AssessmentsTable assessments={assessments} />
    </div>
  );
}
