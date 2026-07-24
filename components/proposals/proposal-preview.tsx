import Image from "next/image";

import { acceptProposal } from "@/lib/actions/proposals";
import {
  formatModuleType,
  formatProposalNumber,
  formatProposalPlan,
  formatProposalStatus,
  formatUnitType,
} from "@/lib/utils/proposals";

type ProposalPreviewProps = {
  proposal: {
    id: string;
    proposalNumber: number;
    title: string;
    status: string;
    plan: string;
    activeCount: number;
    subtotal: unknown;
    discountPercent: unknown;
    discountValue: unknown;
    total: unknown;
    setupFee: unknown;
    partnerCommissionPercent: unknown;
    partnerCommissionValue: unknown;
    monthlySubtotal: unknown;
    setupSubtotal: unknown;
    discountAmount: unknown;
    finalMonthlyPrice: unknown;
    finalSetupPrice: unknown;
    firstMonthTotal: unknown;
    partnerCommissionPct: unknown;
    partnerCommission: unknown;
    partsecNetRevenue: unknown;
    validityDays: number;
    notes: string | null;
    scopeDescription: string | null;
    acceptedByName: string | null;
    acceptedByEmail: string | null;
    acceptedAt: Date | null;
    createdAt: Date;
    customer: {
      companyName: string;
      tradeName: string | null;
      document: string;
      contactName: string;
      contactEmail: string;
      contactPhone: string | null;
    };
    partner: {
      name: string;
      email: string | null;
      phone?: string | null;
      tradeName?: string | null;
      document?: string | null;
    };
    items?: Array<{
      id: string;
      moduleType: string;
      unitType: string;
      description: string | null;
      quantity: number;
      rangeLabel: string;
      monthlyPrice: unknown;
      setupPrice: unknown;
      pricingMode?: string;
      pricingJustification?: string | null;
    }>;
  };
  mode?: "internal" | "public";
};

function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

function getDisplayItems(proposal: ProposalPreviewProps["proposal"]) {
  if (proposal.items && proposal.items.length > 0) {
    return proposal.items.map((item) => ({
      id: item.id,
      moduleLabel: item.description?.trim() || formatModuleType(item.moduleType),
      quantity: item.quantity,
      unitLabel: formatUnitType(item.unitType),
      rangeLabel: item.rangeLabel,
      monthlyPrice: item.monthlyPrice,
      setupPrice: item.setupPrice,
      pricingMode: item.pricingMode ?? "AUTO",
      pricingJustification: item.pricingJustification ?? null,
      isLegacy: false,
    }));
  }

  return [
    {
      id: "legacy-scope",
      moduleLabel: "Infraestrutura",
      quantity: proposal.activeCount,
      unitLabel: "ativos",
      rangeLabel: "Legado",
      monthlyPrice: proposal.subtotal,
      setupPrice: proposal.setupFee,
      pricingMode: "AUTO",
      pricingJustification: null,
      isLegacy: true,
    },
  ];
}

function getFinancialSummary(proposal: ProposalPreviewProps["proposal"]) {
  const hasItems = Boolean(proposal.items && proposal.items.length > 0);

  if (hasItems) {
    return {
      monthlySubtotal: proposal.monthlySubtotal,
      discountPercent: proposal.discountPercent,
      discountAmount: proposal.discountAmount,
      finalMonthlyPrice: proposal.finalMonthlyPrice,
      finalSetupPrice: proposal.finalSetupPrice,
      firstMonthTotal: proposal.firstMonthTotal,
      partnerCommissionPct: proposal.partnerCommissionPct,
      partnerCommission: proposal.partnerCommission,
      partsecNetRevenue: proposal.partsecNetRevenue,
      usesLegacyFallback: false,
    };
  }

  const discountPercent = Number(proposal.discountPercent || 0);
  const discountAmount = Number(proposal.discountValue || 0);
  const finalMonthlyPrice = Number(proposal.total || 0);
  const finalSetupPrice = Number(proposal.setupFee || 0);

  return {
    monthlySubtotal: proposal.subtotal,
    discountPercent,
    discountAmount,
    finalMonthlyPrice,
    finalSetupPrice,
    firstMonthTotal: finalMonthlyPrice + finalSetupPrice,
    partnerCommissionPct: proposal.partnerCommissionPercent,
    partnerCommission: proposal.partnerCommissionValue,
    partsecNetRevenue: finalMonthlyPrice - Number(proposal.partnerCommissionValue || 0),
    usesLegacyFallback: true,
  };
}

export function ProposalPreview({
  proposal,
  mode = "internal",
}: ProposalPreviewProps) {
  const isPublic = mode === "public";
  const displayItems = getDisplayItems(proposal);
  const financial = getFinancialSummary(proposal);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
        <div className="h-5 bg-slate-950" />

        <div className="border-b border-slate-200 px-8 py-8 md:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4">
                <Image
                  src="/brand/partsec-logo.png"
                  alt="Partsec"
                  width={320}
                  height={90}
                  className="h-auto w-[240px] object-contain md:w-[320px]"
                  priority
                />
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-950">
                PROPOSTA COMERCIAL
              </h1>

              <p className="mt-3 text-3xl font-semibold text-blue-700">
                {formatProposalNumber(
                  proposal.proposalNumber,
                  proposal.createdAt
                )}
              </p>
            </div>

            <div className="min-w-[280px] rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xl font-semibold text-slate-950">
                {proposal.title}
              </p>

              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-900">Cliente:</span>{" "}
                  {proposal.customer.companyName}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Plano:</span>{" "}
                  {formatProposalPlan(proposal.plan)}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Status:</span>{" "}
                  {formatProposalStatus(proposal.status)}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Parceiro:</span>{" "}
                  {proposal.partner.name}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Data:</span>{" "}
                  {formatDate(proposal.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-8 py-8 md:px-10">
          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-6">
              <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-blue-800">
                Cliente
              </h2>

              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Razão social
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {proposal.customer.companyName}
                  </p>
                </div>

                {proposal.customer.tradeName ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Nome fantasia
                    </p>
                    <p className="mt-1">{proposal.customer.tradeName}</p>
                  </div>
                ) : null}

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Documento
                  </p>
                  <p className="mt-1">{proposal.customer.document}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Contato
                  </p>
                  <p className="mt-1">{proposal.customer.contactName}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    E-mail
                  </p>
                  <p className="mt-1">{proposal.customer.contactEmail}</p>
                </div>

                {proposal.customer.contactPhone ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Telefone
                    </p>
                    <p className="mt-1">{proposal.customer.contactPhone}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6">
              <h2 className="mb-5 text-sm font-bold uppercase tracking-[0.16em] text-blue-800">
                Dados gerais
              </h2>

              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Número da proposta
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {formatProposalNumber(
                      proposal.proposalNumber,
                      proposal.createdAt
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Título
                  </p>
                  <p className="mt-1">{proposal.title}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Plano
                    </p>
                    <p className="mt-1">{formatProposalPlan(proposal.plan)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Status
                    </p>
                    <p className="mt-1">{formatProposalStatus(proposal.status)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Parceiro responsável
                  </p>
                  <p className="mt-1">
                    {proposal.partner.name} ·{" "}
                    {proposal.partner.email ?? "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Data de criação
                  </p>
                  <p className="mt-1">{formatDate(proposal.createdAt)}</p>
                </div>

                {proposal.status === "ACCEPTED" && proposal.acceptedAt ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-semibold text-green-800">
                      Aceite registrado
                    </p>
                    <div className="mt-2 space-y-1 text-sm text-green-700">
                      <p>
                        <span className="font-medium">Responsável:</span>{" "}
                        {proposal.acceptedByName || "Não informado"}
                      </p>
                      <p>
                        <span className="font-medium">E-mail:</span>{" "}
                        {proposal.acceptedByEmail || "Não informado"}
                      </p>
                      <p>
                        <span className="font-medium">Data:</span>{" "}
                        {new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(new Date(proposal.acceptedAt))}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-blue-200 bg-slate-50 p-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-blue-800">
              Sobre a solução
            </h2>

            <p className="whitespace-pre-line text-base leading-7 text-slate-700">
              O Partsec One é a solução da Partsec para centralização de
              monitoramento, visibilidade operacional e consolidação de
              informações do ambiente de TI e segurança.

              A plataforma permite reunir ativos, eventos e indicadores em uma
              visão única, apoiando a operação com mais agilidade, padronização
              e proatividade.
            </p>
          </section>

          <section className="rounded-2xl border border-blue-200 bg-slate-50 p-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-blue-800">
              Escopo desta proposta
            </h2>

            <p className="whitespace-pre-line text-base leading-7 text-slate-700">
              {proposal.scopeDescription?.trim()
                ? proposal.scopeDescription
                : "Escopo específico não informado."}
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-blue-800">
                  Escopo contratado por módulos
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Itens contemplados na proposta comercial.
                </p>
              </div>

              {financial.usesLegacyFallback ? (
                <p className="text-xs font-medium text-amber-700">
                  Exibindo dados legados para proposta sem itens estruturados.
                </p>
              ) : null}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 bg-white">
                <thead className="bg-slate-950 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Módulo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Quantidade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Unidade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Faixa
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                      Mensalidade
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide">
                      Setup
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {displayItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        <div className="flex flex-col gap-2">
                          <span>{item.moduleLabel}</span>
                          {!isPublic && item.pricingMode === "MANUAL" ? (
                            <span className="w-fit rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                              Preço customizado
                            </span>
                          ) : null}
                        </div>
                        {!isPublic &&
                        item.pricingMode === "MANUAL" &&
                        item.pricingJustification ? (
                          <p className="mt-3 whitespace-pre-line text-xs font-normal leading-5 text-amber-800">
                            {item.pricingJustification}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.unitLabel}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.rangeLabel}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-slate-700">
                        {formatCurrency(item.monthlyPrice)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-slate-700">
                        {formatCurrency(item.setupPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-blue-800">
                Resumo financeiro
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Valores recorrentes e implantação conforme a proposta atual.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  Mensalidade recorrente final
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-950">
                  {formatCurrency(financial.finalMonthlyPrice)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Setup / implantação
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-950">
                  {formatCurrency(financial.finalSetupPrice)}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Total do primeiro mês
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-950">
                  {formatCurrency(financial.firstMonthTotal)}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="grid grid-cols-[1fr_auto] bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
                <div>Descrição</div>
                <div>Valor</div>
              </div>

              <div className="grid grid-cols-[1fr_auto] border-t border-slate-200 px-5 py-4 text-sm text-slate-700">
                <div>Mensalidade bruta</div>
                <div className="font-medium">
                  {formatCurrency(financial.monthlySubtotal)}
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] border-t border-slate-200 px-5 py-4 text-sm text-slate-700">
                <div>Desconto ({Number(financial.discountPercent)}%)</div>
                <div className="font-medium">
                  - {formatCurrency(financial.discountAmount)}
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] border-t border-slate-200 bg-blue-50 px-5 py-4 text-sm font-semibold text-blue-900">
                <div>Mensalidade recorrente final</div>
                <div>{formatCurrency(financial.finalMonthlyPrice)}</div>
              </div>

              <div className="grid grid-cols-[1fr_auto] border-t border-slate-200 px-5 py-4 text-sm text-slate-700">
                <div>Setup / implantação</div>
                <div className="font-medium">
                  {formatCurrency(financial.finalSetupPrice)}
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] border-t border-slate-200 bg-emerald-50 px-5 py-4 text-base font-bold text-emerald-800">
                <div>Total do primeiro mês</div>
                <div>{formatCurrency(financial.firstMonthTotal)}</div>
              </div>
            </div>

            {!isPublic ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Comissão do parceiro
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {Number(financial.partnerCommissionPct)}% ·{" "}
                    {formatCurrency(financial.partnerCommission)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Comissão recorrente mensal sobre a mensalidade final.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Receita líquida Partsec
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatCurrency(financial.partsecNetRevenue)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Receita líquida recorrente mensal da Partsec.
                  </p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-blue-200 bg-slate-50 p-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-blue-800">
              Observações
            </h2>

            <div className="text-base leading-7 text-slate-700">
              {proposal.notes?.trim() ? (
                <p className="whitespace-pre-line">{proposal.notes}</p>
              ) : (
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    Para a habilitação do serviço (enabling), será necessário o
                    alinhamento com a equipe técnica do cliente para o
                    fornecimento dos acessos de coleta de informações.
                  </li>
                  <li>
                    O prazo para a finalização da implementação é de até 30 dias
                    corridos a partir do aceite formal da proposta.
                  </li>
                </ul>
              )}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-blue-800">
                Validade da proposta
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-700">
                Esta proposta é válida por {proposal.validityDays} dias corridos
                a partir da data de emissão.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-blue-800">
                Condições comerciais
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-700">
                Os valores apresentados contemplam o escopo descrito nesta
                proposta. O setup inicial é cobrado em parcela única e a
                mensalidade refere-se à recorrência do serviço. Quaisquer
                alterações de escopo poderão implicar revisão comercial. O
                início da operação está condicionado ao aceite da proposta e ao
                alinhamento de implantação.
              </p>
            </div>
          </section>

          {isPublic && proposal.status !== "ACCEPTED" ? (
            <form
              action={acceptProposal}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <input type="hidden" name="proposalId" value={proposal.id} />

              <h2 className="text-lg font-semibold text-slate-950">
                Aceite da proposta
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Ao aceitar esta proposta, o cliente declara estar de acordo com
                os termos e condições comerciais apresentados.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="acceptedByName"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Nome do responsável pelo aceite
                  </label>
                  <input
                    id="acceptedByName"
                    name="acceptedByName"
                    type="text"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500"
                    placeholder="Nome completo"
                  />
                </div>

                <div>
                  <label
                    htmlFor="acceptedByEmail"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    E-mail do responsável pelo aceite
                  </label>
                  <input
                    id="acceptedByEmail"
                    name="acceptedByEmail"
                    type="email"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500"
                    placeholder="email@empresa.com.br"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Aceitar proposta
                </button>
              </div>
            </form>
          ) : null}

          {isPublic && proposal.status === "ACCEPTED" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
              <h2 className="text-lg font-semibold">Proposta aceita</h2>
              <div className="mt-3 space-y-1 text-sm">
                {proposal.acceptedByName ? (
                  <p>
                    <span className="font-medium">Responsável:</span>{" "}
                    {proposal.acceptedByName}
                  </p>
                ) : null}
                {proposal.acceptedByEmail ? (
                  <p>
                    <span className="font-medium">E-mail:</span>{" "}
                    {proposal.acceptedByEmail}
                  </p>
                ) : null}
                {proposal.acceptedAt ? (
                  <p>
                    <span className="font-medium">Data:</span>{" "}
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(proposal.acceptedAt))}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </article>
    </div>
  );
}
