import {
  formatProposalNumber,
  formatProposalPlan,
  formatProposalStatus,
} from "@/lib/utils/proposals";
import { acceptProposal } from "@/lib/actions/proposals";
import Image from "next/image";

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

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(value);
}

export function ProposalPreview({
  proposal,
  mode = "internal",
}: ProposalPreviewProps) {
  const isPublic = mode === "public";

  return (
    <article
      className={`mx-auto w-full rounded-2xl border border-slate-200 bg-white shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none ${
        isPublic ? "max-w-3xl p-10 shadow-lg" : "max-w-5xl p-8"
      }`}
    >
<header className="border-b border-slate-200 pb-6">
  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
    <div>
      <div className="mb-3">
        <Image
          src="/brand/partsec-logo.png"
          alt="Partsec"
          width={160}
          height={48}
          className="h-auto w-auto object-contain"
          priority
        />
      </div>

      <h1 className="text-3xl font-semibold text-slate-950">
        Proposta Comercial
      </h1>

      <p className="mt-2 text-sm font-medium text-blue-600">
        {formatProposalNumber(proposal.proposalNumber, proposal.createdAt)}
      </p>
    </div>

    <div className="space-y-1 text-sm text-slate-600 md:text-right">
      <p>
        <span className="font-medium text-slate-900">Título:</span>{" "}
        {proposal.title}
      </p>
      <p>
        <span className="font-medium text-slate-900">Data:</span>{" "}
        {formatDate(proposal.createdAt)}
      </p>
      <p>
        <span className="font-medium text-slate-900">Status:</span>{" "}
        {formatProposalStatus(proposal.status)}
      </p>
    </div>
  </div>
</header>

{proposal.status === "ACCEPTED" && proposal.acceptedAt ? (
  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
    <p className="font-medium">Aceite registrado</p>
    <p className="mt-1">
      Responsável: {proposal.acceptedByName || "Não informado"}
    </p>
    <p>E-mail: {proposal.acceptedByEmail || "Não informado"}</p>
    <p>
      Data:{" "}
      {new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(proposal.acceptedAt))}
    </p>
  </div>
) : null}

      <section className="grid gap-6 border-b border-slate-200 py-6 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Cliente
          </h2>

          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p className="font-semibold text-slate-950">
              {proposal.customer.companyName}
            </p>

            {proposal.customer.tradeName ? (
              <p>{proposal.customer.tradeName}</p>
            ) : null}

            <p>{proposal.customer.document}</p>
            <p>{proposal.customer.contactName}</p>
            <p>{proposal.customer.contactEmail}</p>

            {proposal.customer.contactPhone ? (
              <p>{proposal.customer.contactPhone}</p>
            ) : null}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Parceiro responsável
          </h2>

          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p className="font-semibold text-slate-950">{proposal.partner.name}</p>
            <p>{proposal.partner.email}</p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 py-6">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Sobre a solução
          </h2>

          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
            O Partsec One é a solução da Partsec para centralização de
            monitoramento, visibilidade operacional e consolidação de informações
            do ambiente de TI e segurança.

            A plataforma permite reunir ativos, eventos e indicadores em uma
            visão única, apoiando a operação com mais agilidade, padronização e
            proatividade.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 py-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Escopo desta proposta
        </h2>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {proposal.scopeDescription ? (
            <p className="whitespace-pre-line">{proposal.scopeDescription}</p>
          ) : (
            <p className="text-slate-500">Escopo específico não informado.</p>
          )}
        </div>
      </section>

      <section className="border-b border-slate-200 py-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Escopo comercial
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Plano
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {formatProposalPlan(proposal.plan)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Quantidade de ativos
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {proposal.activeCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Preço unitário
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {formatCurrency(proposal.unitPrice)}
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 py-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Resumo financeiro
        </h2>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            <div>Descrição</div>
            <div className="text-right">Valor</div>
          </div>

          <div className="grid grid-cols-2 border-b border-slate-200 px-4 py-3 text-sm text-slate-700">
            <div>Assinatura mensal</div>
            <div className="text-right">{formatCurrency(proposal.subtotal)}</div>
          </div>

          {Number(proposal.discountValue) > 0 ? (
            <div className="grid grid-cols-2 border-b border-slate-200 px-4 py-3 text-sm text-slate-700">
              <div>Desconto mensal ({Number(proposal.discountPercent)}%)</div>
              <div className="text-right">
                - {formatCurrency(proposal.discountValue)}
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 border-b border-slate-200 px-4 py-3 text-sm text-slate-700">
            <div>Setup inicial (único)</div>
            <div className="text-right">{formatCurrency(proposal.setupFee)}</div>
          </div>

          <div className="grid grid-cols-2 px-4 py-4 text-base font-semibold text-slate-950">
            <div>Total mensal</div>
            <div className="text-right">{formatCurrency(proposal.total)}</div>
          </div>
        </div>

        {!isPublic ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Comissão do parceiro
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {Number(proposal.partnerCommissionPercent)}% ·{" "}
              {formatCurrency(proposal.partnerCommissionValue)}
            </p>
          </div>
        ) : null}
      </section>

      <section className="py-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Observações
        </h2>

        <div className="mt-4 min-h-28 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
          {proposal.notes ? (
            <p className="whitespace-pre-line">{proposal.notes}</p>
          ) : (
            <p className="text-slate-500">Nenhuma observação registrada.</p>
          )}
        </div>
      </section>
      <section className="border-t border-slate-200 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Validade da proposta
            </h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Esta proposta é válida por 15 dias corridos a partir da data de emissão.
              </p>
        </div>

    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Condições comerciais
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Os valores apresentados contemplam o escopo descrito nesta proposta.
        O setup inicial é cobrado em parcela única e a mensalidade refere-se
        à recorrência do serviço. Quaisquer alterações de escopo poderão
        implicar revisão comercial. O início da operação está condicionado ao
        aceite da proposta e ao alinhamento de implantação.
      </p>
    </div>
  </div>
</section>

      {isPublic && proposal.status !== "ACCEPTED" ? (
  <form action={acceptProposal} className="mt-6 space-y-4">
    <input type="hidden" name="proposalId" value={proposal.id} />

    <div className="grid gap-4 md:grid-cols-2">
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
      className="w-full rounded-xl bg-slate-900 py-3 text-white hover:bg-slate-800"
    >
      Aceitar proposta
    </button>
  </form>
) : null}

{isPublic && proposal.status === "ACCEPTED" ? (
  <div className="mt-6 rounded-xl bg-green-100 p-4 text-green-800">
    <p className="font-medium">Proposta aceita ✔</p>

    {proposal.acceptedByName ? (
      <p className="mt-2 text-sm">
        Responsável: {proposal.acceptedByName}
      </p>
    ) : null}

    {proposal.acceptedByEmail ? (
      <p className="text-sm">E-mail: {proposal.acceptedByEmail}</p>
    ) : null}

    {proposal.acceptedAt ? (
      <p className="text-sm">
        Data do aceite:{" "}
        {new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(proposal.acceptedAt))}
      </p>
    ) : null}
  </div>
) : null}

      <footer className="border-t border-slate-200 pt-6 text-xs text-slate-500">
        <p>Documento gerado pelo Portal Comercial Partsec.</p>
      </footer>
    </article>
  );
}
