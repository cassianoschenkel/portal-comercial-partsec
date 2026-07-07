import { ASSESSMENT_SECTIONS } from "@/lib/assessments/catalog";

type Props = {
  answers: unknown;
};

function getAnswerValue(
  answers: unknown,
  sectionKey: string,
  questionName: string
) {
  if (!answers || typeof answers !== "object") {
    return "";
  }

  const section = (answers as Record<string, unknown>)[sectionKey];

  if (!section || typeof section !== "object") {
    return "";
  }

  const fieldKey = questionName.split(".")[1];
  const value = fieldKey
    ? (section as Record<string, unknown>)[fieldKey]
    : undefined;

  return typeof value === "string" ? value : "";
}

export function AssessmentAnswers({ answers }: Props) {
  return (
    <div className="space-y-5">
      {ASSESSMENT_SECTIONS.map((section) => (
        <section
          key={section.key}
          className="rounded-lg border border-slate-200 bg-white p-5"
        >
          <h2 className="text-lg font-semibold text-slate-950">
            {section.title}
          </h2>

          <dl className="mt-4 grid gap-4 md:grid-cols-2">
            {section.questions.map((question) => {
              const value = getAnswerValue(answers, section.key, question.name);

              return (
                <div
                  key={question.name}
                  className={question.type === "textarea" ? "md:col-span-2" : ""}
                >
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {question.label}
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                    {value || "-"}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}
