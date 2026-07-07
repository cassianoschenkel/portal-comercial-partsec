import Link from "next/link";
import type { AssessmentStatus, AssessmentType } from "@prisma/client";

import {
  ASSESSMENT_STATUS_LABELS,
  ASSESSMENT_TYPE_LABELS,
  getAssessmentStatusBadgeClasses,
} from "@/lib/assessments/catalog";

type AssessmentRow = {
  id: string;
  title: string;
  status: AssessmentStatus;
  type: AssessmentType;
  tokenExpiresAt: Date | null;
  submittedAt: Date | null;
  createdAt: Date;
  customer: { companyName: string };
  partner: { companyName: string } | null;
};

function formatDate(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function AssessmentsTable({
  assessments,
}: {
  assessments: AssessmentRow[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Assessment
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cliente
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tipo
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Validade
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Submissão
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ações
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {assessments.map((assessment) => (
            <tr key={assessment.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-sm font-medium text-slate-900">
                {assessment.title}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {assessment.customer.companyName}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {ASSESSMENT_TYPE_LABELS[assessment.type]}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getAssessmentStatusBadgeClasses(
                    assessment.status
                  )}`}
                >
                  {ASSESSMENT_STATUS_LABELS[assessment.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {formatDate(assessment.tokenExpiresAt)}
              </td>
              <td className="px-4 py-3 text-sm text-slate-700">
                {formatDate(assessment.submittedAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/dashboard/assessments/${assessment.id}`}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}

          {assessments.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-8 text-center text-sm text-slate-500"
              >
                Nenhum assessment cadastrado.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
