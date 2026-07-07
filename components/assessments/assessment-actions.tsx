"use client";

import { useTransition } from "react";

import {
  cancelAssessment,
  regenerateAssessmentLink,
} from "@/lib/actions/assessments";

type Props = {
  assessmentId: string;
  canManage: boolean;
  isSubmitted: boolean;
  isCancelled: boolean;
};

export function AssessmentActions({
  assessmentId,
  canManage,
  isSubmitted,
  isCancelled,
}: Props) {
  const [isPending, startTransition] = useTransition();

  if (!canManage) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {!isSubmitted && !isCancelled ? (
        <form action={regenerateAssessmentLink.bind(null, assessmentId)}>
          <input type="hidden" name="validityDays" value="15" />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Gerar/regenerar link
          </button>
        </form>
      ) : null}

      {!isCancelled && !isSubmitted ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await cancelAssessment(assessmentId);
            });
          }}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          Revogar/cancelar
        </button>
      ) : null}
    </div>
  );
}
