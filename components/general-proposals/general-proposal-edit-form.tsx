"use client";

import { GeneralProposalType } from "@prisma/client";
import Link from "next/link";
import { useActionState } from "react";

import {
  updateGeneralProposal,
  type GeneralProposalActionState,
} from "@/lib/actions/general-proposals";
import { generalProposalTypeLabels } from "@/lib/general-proposals/presentation";

type Proposal = {
  id: string;
  title: string;
  proposalType: GeneralProposalType;
  vendorId: string;
  licenseTermMonths: number | null;
  validUntil: string;
  paymentTerms: string | null;
  executiveSummary: string | null;
  projectScope: string | null;
  commercialNotes: string | null;
  internalNotes: string | null;
  customerName: string;
  currency: string;
};

const initialState: GeneralProposalActionState = {
  success: false,
  error: null,
  message: null,
};

export function GeneralProposalEditForm({
  proposal,
  vendors,
}: {
  proposal: Proposal;
  vendors: Array<{ id: string; name: string }>;
}) {
  const [state, formAction, isPending] = useActionState(
    updateGeneralProposal,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="proposalId" value={proposal.id} />

      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Dados principais</h2>
          <p className="mt-1 text-sm text-slate-600">
            Cliente, número da proposta e moeda não podem ser alterados nesta tela.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Cliente</label>
            <input value={proposal.customerName} disabled className="mt-2 w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Moeda</label>
            <input value={proposal.currency} disabled className="mt-2 w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">Título</label>
            <input id="title" name="title" defaultValue={proposal.title} required disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
          </div>
          <div>
            <label htmlFor="vendorId" className="block text-sm font-medium text-slate-700">Fabricante principal</label>
            <select id="vendorId" name="vendorId" defaultValue={proposal.vendorId} required disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100">
              {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="proposalType" className="block text-sm font-medium text-slate-700">Tipo da proposta</label>
            <select id="proposalType" name="proposalType" defaultValue={proposal.proposalType} required disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100">
              {Object.values(GeneralProposalType).map((type) => <option key={type} value={type}>{generalProposalTypeLabels[type]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="licenseTermMonths" className="block text-sm font-medium text-slate-700">Prazo de licenciamento (meses)</label>
            <input id="licenseTermMonths" name="licenseTermMonths" type="number" min={1} step={1} defaultValue={proposal.licenseTermMonths ?? ""} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
          </div>
          <div>
            <label htmlFor="validUntil" className="block text-sm font-medium text-slate-700">Validade da proposta</label>
            <input id="validUntil" name="validUntil" type="date" defaultValue={proposal.validUntil} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Conteúdo comercial</h2>
          <p className="mt-1 text-sm text-slate-600">Informações apresentadas no conteúdo comercial da proposta.</p>
        </div>
        {[
          ["paymentTerms", "Condições comerciais", 4, proposal.paymentTerms],
          ["executiveSummary", "Resumo executivo", 5, proposal.executiveSummary],
          ["projectScope", "Escopo do projeto", 6, proposal.projectScope],
          ["commercialNotes", "Observações comerciais", 4, proposal.commercialNotes],
        ].map(([name, label, rows, value]) => (
          <div key={String(name)}>
            <label htmlFor={String(name)} className="block text-sm font-medium text-slate-700">{label}</label>
            <textarea id={String(name)} name={String(name)} rows={Number(rows)} defaultValue={String(value ?? "")} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <label htmlFor="internalNotes" className="block text-sm font-semibold text-amber-900">Observações internas</label>
        <p className="mt-1 text-xs text-amber-700">Uso exclusivo da Partsec. Este conteúdo não aparece para o cliente.</p>
        <textarea id="internalNotes" name="internalNotes" rows={6} defaultValue={proposal.internalNotes ?? ""} disabled={isPending} className="mt-3 w-full rounded-md border border-amber-300 bg-white px-3 py-2 disabled:bg-slate-100" />
      </section>

      <div className="flex justify-end gap-3">
        <Link href={`/dashboard/comercial/propostas-gerais/${proposal.id}`} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancelar</Link>
        <button type="submit" disabled={isPending} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
          {isPending ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
