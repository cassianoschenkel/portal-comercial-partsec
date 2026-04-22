import Image from "next/image";

import {
  formatProposalNumber,
  formatProposalPlan,
  formatProposalStatus,
} from "@/lib/utils/proposals";
import { acceptProposal } from "@/lib/actions/proposals";

type ProposalPreviewProps = {
  proposal: {
    id: string;
    proposalNumber: number;
    title: string;
    status: string;
    plan: string;
    activeCount: number;
    unitPrice: unknown;
    subtotal: unknown;
    discountPercent: unknown;
    discountValue: unknown;
    total: unknown;
    setupFee: unknown;
    partnerCommissionPercent: unknown;
    partnerCommissionValue: unknown;
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
      email: string;
    };
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

export function ProposalPreview({
  proposal,
  mode = "internal",
}: ProposalPreviewProps) {
  const isPublic = mode === "public";

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

            <div className="min-w-[280px] space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xl font-semibold text-slate-950">
                {proposal.title}
              </p>

              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-900">Data:</span>{" "}
                  {formatDate(proposal.createdAt)}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Status:</span>{" "}
                  {formatProposalStatus(proposal.status)}
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
                Parceiro
              </h2>

              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Nome
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    {proposal.partner.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    E-mail
                  </p>
                  <p className="mt-1">{proposal.partner.email}</p>
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

          <section className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-blue-800">
                Configuração da proposta
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Plano
                  </p>
                  <p className="mt-4 text-3xl font-bold text-blue-700">
                    {formatProposalPlan(proposal.plan)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Ativos
                  </p>
                  <p className="mt-4 text-3xl font-bold text-blue-700">
                    {proposal.activeCount}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-blue-800">
                Financeiro
              </h2>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="grid grid-cols-[1fr_auto] bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
                  <div>Descrição</div>
                  <div>Valor</div>
                </div>

                <div className="grid grid-cols-[1fr_auto] border-t border-slate-200 px-5 py-4 text-sm text-slate-700">
                  <div>Assinatura mensal</div>
                  <div className="font-medium">
                    {formatCurrency(proposal.subtotal)}
                  </div>
                </div>

                {Number(proposal.discountValue) > 0 ? (
                  <div className="grid grid-cols-[1fr_auto] border-t border-slate-200 px-5 py-4 text-sm text-slate-700">
                    <div>
                      Desconto mensal ({Number(proposal.discountPercent)}%)
                    </div>
                    <div className="font-medium">
                      - {formatCurrency(proposal.discountValue)}
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-[1fr_auto] border-t border-slate-200 px-5 py-4 text-sm text-slate-700">
                  <div>Setup inicial (único)</div>
                  <div className="font-medium">
                    {formatCurrency(proposal.setupFee)}
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] border-t border-slate-200 bg-slate-50 px-5 py-4 text-base font-bold text-blue-800">
                  <div>Total mensal</div>
                  <div>{formatCurrency(proposal.total)}</div>
                </div>
              </div>

              {!isPublic ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Comissão do parceiro
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {Number(proposal.partnerCommissionPercent)}% ·{" "}
                    {formatCurrency(proposal.partnerCommissionValue)}
                  </p>
                </div>
              ) : null}
            </div>
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
                    fornecimento dos acessos de coleta de informações (API,
                    syslog, SNMP, etc).
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
                Esta proposta é válida por 15 dias corridos a partir da data de
                emissão.
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
            <form action={acceptProposal} className="rounded-2xl border border-slate-200 bg-white p-6">
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
                    E-mail do responsável
                  </label>
                  <input
                    id="acceptedByEmail"
                    name="acceptedByEmail"
                    type="email"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-500"
                    placeholder="email@empresa.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-slate-950 py-3 text-white hover:bg-slate-800"
              >
                Aceitar proposta
              </button>
            </form>
          ) : null}

          {isPublic && proposal.status === "ACCEPTED" ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
              <p className="text-lg font-semibold text-green-800">
                Proposta aceita ✔
              </p>

              <div className="mt-3 space-y-1 text-sm text-green-700">
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
                    <span className="font-medium">Data do aceite:</span>{" "}
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(new Date(proposal.acceptedAt))}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <footer className="flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>www.partsec.com.br</p>
            <p>comercial@partsec.com.br</p>
            <p>+55 51 99329-6675</p>
          </footer>
        </div>
      </article>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
        <div className="h-5 bg-slate-950" />

        <div className="grid gap-8 px-8 py-8 md:px-10 lg:grid-cols-[1fr_1.2fr]">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-xl font-bold text-blue-800">Sobre a Partsec</h2>

            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
              <p>
                A Partsec é uma empresa brasileira especializada em
                monitoramento, visibilidade e resposta para ambientes de TI e
                Segurança.
              </p>

              <p>
                Combinamos tecnologia, automação e inteligência para entregar
                operações mais eficientes, seguras e resilientes.
              </p>

              <ul className="list-disc space-y-1 pl-5">
                <li>Monitoramento 24x7</li>
                <li>Visibilidade unificada</li>
                <li>Resposta rápida e assertiva</li>
                <li>Relatórios e indicadores inteligentes</li>
                <li>Equipe especialista e certificada</li>
              </ul>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-medium leading-6">
                Nosso propósito é transformar dados em ação para que nossos
                clientes operem com confiança e foco no que realmente importa.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-blue-800">
              Aceite da proposta
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-700">
              Ao assinar abaixo, o cliente declara que está de acordo com os
              termos e condições desta proposta comercial.
            </p>

            <div className="mt-8 space-y-5 text-sm text-slate-700">
              <div>
                <p className="mb-2">Empresa / Cliente:</p>
                <div className="h-8 border-b border-slate-400" />
              </div>

              <div>
                <p className="mb-2">Nome do responsável:</p>
                <div className="h-8 border-b border-slate-400" />
              </div>

              <div>
                <p className="mb-2">Cargo:</p>
                <div className="h-8 w-2/3 border-b border-slate-400" />
              </div>

              <div>
                <p className="mb-2">Data:</p>
                <div className="h-8 w-1/2 border-b border-slate-400" />
              </div>

              <div className="mt-8 rounded-2xl border border-slate-300 p-6">
                <div className="h-24 border-b border-slate-400" />
                <p className="mt-3 text-center text-sm text-slate-600">
                  Assinatura do responsável
                </p>
              </div>
            </div>
          </section>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 px-8 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between md:px-10">
          <p>www.partsec.com.br</p>
          <p>comercial@partsec.com.br</p>
          <p>+55 51 99329-6675</p>
        </footer>
      </article>
    </div>
  );
}