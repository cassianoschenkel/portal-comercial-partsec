import type { Prisma } from "@prisma/client";

import type { buildGeneralProposalInternalSummary } from "@/lib/general-proposals/summary";

type Summary = ReturnType<typeof buildGeneralProposalInternalSummary>;
type DecimalValue = string | number | Prisma.Decimal;

function formatCurrency(value: DecimalValue, currency: string) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(Number(value));
  } catch {
    return `${currency} ${Number(value).toFixed(2)}`;
  }
}

function formatPercent(value: DecimalValue) {
  return `${Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

const healthClasses = {
  healthy: "border-emerald-200 bg-emerald-50 text-emerald-800",
  attention: "border-blue-200 bg-blue-50 text-blue-800",
  low: "border-amber-200 bg-amber-50 text-amber-900",
  negative: "border-red-200 bg-red-50 text-red-800",
};

const alertClasses = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-800",
};

export function GeneralProposalInternalSummary({
  currency,
  financial,
  summary,
}: {
  currency: string;
  financial: {
    subtotalProducts: DecimalValue;
    subtotalServices: DecimalValue;
    totalCost: DecimalValue;
    totalSalePrice: DecimalValue;
    totalDiscount: DecimalValue;
    finalPrice: DecimalValue;
    grossProfit: DecimalValue;
    grossMarginPercent: DecimalValue;
    markupPercent: DecimalValue;
  };
  summary: Summary;
}) {
  const financialCards = [
    ["Subtotal de produtos", formatCurrency(financial.subtotalProducts, currency)],
    ["Subtotal de serviços", formatCurrency(financial.subtotalServices, currency)],
    ["Custo total", formatCurrency(financial.totalCost, currency)],
    ["Venda bruta", formatCurrency(financial.totalSalePrice, currency)],
    ["Desconto total", formatCurrency(financial.totalDiscount, currency)],
    ["Valor final ao cliente", formatCurrency(financial.finalPrice, currency)],
    ["Lucro bruto", formatCurrency(financial.grossProfit, currency)],
    ["Margem bruta", formatPercent(financial.grossMarginPercent)],
    ["Markup", formatPercent(financial.markupPercent)],
  ] as const;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Visão restrita à equipe Partsec
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            Resumo financeiro interno
          </h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {financialCards.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`rounded-xl border p-6 ${healthClasses[summary.health.level]}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Saúde comercial</p>
            <h2 className="mt-1 text-xl font-semibold">{summary.health.label}</h2>
          </div>
          <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-semibold">
            {formatPercent(financial.grossMarginPercent)}
          </span>
        </div>
        <p className="mt-4 text-sm font-medium">{summary.health.description}</p>
        <p className="mt-1 text-sm opacity-80">Sugestão interna: {summary.health.suggestion}</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-950">Alertas internos</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {summary.alerts.length}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {summary.alerts.map((alert, index) => (
              <div key={`${alert.title}-${index}`} className={`rounded-lg border px-4 py-3 ${alertClasses[alert.level]}`}>
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="mt-1 text-xs opacity-80">{alert.description}</p>
              </div>
            ))}
            {summary.alerts.length === 0 ? (
              <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                Nenhum alerta comercial identificado.
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-950">Prontidão para envio</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              summary.readiness.status === "ready"
                ? "bg-emerald-100 text-emerald-700"
                : summary.readiness.status === "attention"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-700"
            }`}>
              {summary.readiness.label}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Checklist preparatório para revisão e futura geração de PDF. O status da proposta não é alterado automaticamente.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {summary.readiness.items.map((item) => (
              <div key={item.label} className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                item.complete
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              }`}>
                <span className="font-bold">{item.complete ? "OK" : "—"}</span>
                {item.label}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
