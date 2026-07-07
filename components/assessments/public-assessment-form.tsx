import { submitPublicAssessment } from "@/lib/actions/assessments";
import { ASSESSMENT_SECTIONS } from "@/lib/assessments/catalog";

type Props = {
  token: string;
};

export function PublicAssessmentForm({ token }: Props) {
  return (
    <form action={submitPublicAssessment} className="space-y-8">
      <input type="hidden" name="token" value={token} />

      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
        Não informe senhas, chaves privadas, tokens de API ou credenciais de
        acesso neste formulário.
      </div>

      {ASSESSMENT_SECTIONS.map((section) => (
        <section
          key={section.key}
          className="rounded-lg border border-slate-200 bg-white p-5"
        >
          <h2 className="text-lg font-semibold text-slate-950">
            {section.title}
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {section.questions.map((question) => {
              const baseClass =
                "mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm";

              return (
                <div
                  key={question.name}
                  className={question.type === "textarea" ? "md:col-span-2" : ""}
                >
                  <label
                    htmlFor={question.name}
                    className="block text-sm font-medium text-slate-700"
                  >
                    {question.label}
                    {question.required ? " *" : ""}
                  </label>

                  {question.type === "textarea" ? (
                    <textarea
                      id={question.name}
                      name={question.name}
                      required={question.required}
                      rows={4}
                      className={baseClass}
                    />
                  ) : null}

                  {question.type === "select" ? (
                    <select
                      id={question.name}
                      name={question.name}
                      required={question.required}
                      defaultValue=""
                      className={baseClass}
                    >
                      <option value="">Selecione</option>
                      {question.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : null}

                  {question.type === "text" || question.type === "number" ? (
                    <input
                      id={question.name}
                      name={question.name}
                      type={question.type}
                      min={question.type === "number" ? 0 : undefined}
                      required={question.required}
                      className={baseClass}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Enviar levantamento técnico
        </button>
      </div>
    </form>
  );
}
