"use client";

import {
  GeneralProposalServiceType,
  GeneralServicePricingMode,
} from "@prisma/client";
import type { FormEvent } from "react";
import { useActionState, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createGeneralProposalService,
  deleteGeneralProposalService,
  updateGeneralProposalService,
  type GeneralProposalServiceActionState,
} from "@/lib/actions/general-proposal-services";

export type GeneralProposalServiceView = {
  id: string;
  serviceName: string;
  description: string | null;
  serviceType: GeneralProposalServiceType;
  pricingMode: GeneralServicePricingMode;
  estimatedHours: string;
  internalHourlyCost: string;
  saleHourlyRate: string;
  fixedCost: string;
  fixedSalePrice: string;
  totalCost: string;
  totalSalePrice: string;
  grossProfit: string;
  grossMarginPercent: string;
  isVisibleToClient: boolean;
  internalNotes: string | null;
  sortOrder: number;
};

const initialState: GeneralProposalServiceActionState = {
  success: false,
  error: null,
  message: null,
};

const serviceTypeLabels: Record<GeneralProposalServiceType, string> = {
  IMPLEMENTATION: "Implementação",
  MIGRATION: "Migração",
  CONFIGURATION: "Configuração",
  TRAINING: "Treinamento",
  CONSULTING: "Consultoria",
  HEALTH_CHECK: "Health check",
  SUPPORT_HOURS: "Horas de suporte",
  PROJECT_MANAGEMENT: "Gestão de projeto",
  OTHER: "Outro",
};

const pricingModeLabels: Record<GeneralServicePricingMode, string> = {
  HOURLY: "Por hora",
  FIXED: "Valor fixo",
  MANUAL: "Manual",
};

function formatCurrency(value: string, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(Number(value));
}

function ServiceForm({
  proposalId,
  service,
  onSaved,
  onCancel,
}: {
  proposalId: string;
  service: GeneralProposalServiceView | null;
  onSaved: (message: string) => void;
  onCancel: () => void;
}) {
  const action = service
    ? updateGeneralProposalService.bind(null, proposalId, service.id)
    : createGeneralProposalService.bind(null, proposalId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [pricingMode, setPricingMode] = useState<GeneralServicePricingMode>(
    service?.pricingMode ?? GeneralServicePricingMode.FIXED
  );
  const isHourly = pricingMode === GeneralServicePricingMode.HOURLY;

  useEffect(() => {
    if (state.success && state.message) onSaved(state.message);
  }, [onSaved, state.message, state.success]);

  return (
    <form action={formAction} className="space-y-5 border-t border-slate-200 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-950">
            {service ? "Editar serviço" : "Adicionar serviço"}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Valores monetários serão arredondados para duas casas decimais.
          </p>
        </div>
        <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-600 hover:text-slate-950">
          Fechar
        </button>
      </div>

      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-2">
          <label htmlFor="serviceName" className="block text-sm font-medium text-slate-700">Serviço</label>
          <input id="serviceName" name="serviceName" defaultValue={service?.serviceName ?? ""} required disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="serviceType" className="block text-sm font-medium text-slate-700">Tipo</label>
          <select id="serviceType" name="serviceType" defaultValue={service?.serviceType ?? GeneralProposalServiceType.IMPLEMENTATION} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100">
            {Object.values(GeneralProposalServiceType).map((type) => <option key={type} value={type}>{serviceTypeLabels[type]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="pricingMode" className="block text-sm font-medium text-slate-700">Modo de cobrança</label>
          <select id="pricingMode" name="pricingMode" value={pricingMode} onChange={(event) => setPricingMode(event.target.value as GeneralServicePricingMode)} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100">
            {Object.values(GeneralServicePricingMode).map((mode) => <option key={mode} value={mode}>{pricingModeLabels[mode]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="estimatedHours" className="block text-sm font-medium text-slate-700">Horas estimadas</label>
          <input id="estimatedHours" name="estimatedHours" type="number" min="0.01" step="0.01" defaultValue={service?.estimatedHours ?? "1"} required={isHourly} disabled={isPending || !isHourly} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="internalHourlyCost" className="block text-sm font-medium text-slate-700">Custo interno por hora</label>
          <input id="internalHourlyCost" name="internalHourlyCost" type="number" min="0" step="0.01" defaultValue={service?.internalHourlyCost ?? "0"} disabled={isPending || !isHourly} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="saleHourlyRate" className="block text-sm font-medium text-slate-700">Valor de venda por hora</label>
          <input id="saleHourlyRate" name="saleHourlyRate" type="number" min="0" step="0.01" defaultValue={service?.saleHourlyRate ?? "0"} disabled={isPending || !isHourly} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="fixedCost" className="block text-sm font-medium text-slate-700">Custo fixo</label>
          <input id="fixedCost" name="fixedCost" type="number" min="0" step="0.01" defaultValue={service?.fixedCost ?? "0"} disabled={isPending || isHourly} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="fixedSalePrice" className="block text-sm font-medium text-slate-700">Valor final fixo</label>
          <input id="fixedSalePrice" name="fixedSalePrice" type="number" min="0" step="0.01" defaultValue={service?.fixedSalePrice ?? "0"} disabled={isPending || isHourly} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-slate-700">Ordem</label>
          <input id="sortOrder" name="sortOrder" type="number" min={0} step={1} defaultValue={service?.sortOrder ?? 0} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div className="md:col-span-2 xl:col-span-3">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descrição</label>
          <textarea id="description" name="description" rows={3} defaultValue={service?.description ?? ""} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
        <label htmlFor="serviceInternalNotes" className="block text-sm font-semibold text-amber-900">Notas internas do serviço</label>
        <p className="mt-1 text-xs text-amber-700">Não serão exibidas ao cliente.</p>
        <textarea id="serviceInternalNotes" name="internalNotes" rows={3} defaultValue={service?.internalNotes ?? ""} disabled={isPending} className="mt-3 w-full rounded-md border border-amber-300 bg-white px-3 py-2 disabled:bg-slate-100" />
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
        <input name="isVisibleToClient" type="checkbox" defaultChecked={service?.isVisibleToClient ?? true} disabled={isPending} className="h-4 w-4 rounded border-slate-300" />
        Visível ao cliente
      </label>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={isPending} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
        <button type="submit" disabled={isPending} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
          {isPending ? "Salvando..." : service ? "Salvar alterações" : "Adicionar serviço"}
        </button>
      </div>
    </form>
  );
}

function DeleteServiceButton({ proposalId, serviceId }: { proposalId: string; serviceId: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    deleteGeneralProposalService.bind(null, proposalId, serviceId),
    initialState
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [router, state.success]);

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Remover este serviço da proposta?")) event.preventDefault();
  }

  return (
    <form action={formAction} onSubmit={confirmDelete} className="space-y-1">
      <button type="submit" disabled={isPending} className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
        {isPending ? "Removendo..." : "Remover"}
      </button>
      {state.error ? <p className="max-w-48 text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}

export function GeneralProposalServicesSection({
  proposalId,
  currency,
  editable,
  services,
  analysis,
}: {
  proposalId: string;
  currency: string;
  editable: boolean;
  services: GeneralProposalServiceView[];
  analysis: {
    count: number;
    totalCost: string;
    totalSale: string;
    grossProfit: string;
    grossMarginPercent: string;
    lowestMarginName: string | null;
    lowestMarginPercent: string | null;
    belowCostCount: number;
  };
}) {
  const router = useRouter();
  const [editingService, setEditingService] = useState<GeneralProposalServiceView | null | undefined>();
  const [notice, setNotice] = useState<string | null>(null);
  const handleSaved = useCallback((message: string) => {
    setNotice(message);
    setEditingService(undefined);
    router.refresh();
  }, [router]);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Serviços</h2>
          <p className="mt-1 text-sm text-slate-600">Implementação, consultoria e demais serviços da proposta.</p>
        </div>
        {editable ? <button type="button" onClick={() => { setNotice(null); setEditingService(null); }} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">Adicionar serviço</button> : null}
      </div>

      {notice ? <div className="mx-6 mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</div> : null}
      {!editable ? <div className="mx-6 mb-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Esta proposta está em modo somente leitura para serviços.</div> : null}

      <div className="grid gap-3 border-t border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          ["Serviços", String(analysis.count)],
          ["Custo", formatCurrency(analysis.totalCost, currency)],
          ["Venda", formatCurrency(analysis.totalSale, currency)],
          ["Lucro", formatCurrency(analysis.grossProfit, currency)],
          ["Margem consolidada", `${Number(analysis.grossMarginPercent).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`],
          ["Menor margem", analysis.lowestMarginName && analysis.lowestMarginPercent !== null
            ? `${analysis.lowestMarginName} (${Number(analysis.lowestMarginPercent).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%)`
            : "—"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
          </div>
        ))}
        {analysis.belowCostCount > 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-6 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
            {analysis.belowCostCount} serviço(s) abaixo do custo.
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto border-t border-slate-200">
        <table className="min-w-[1200px] divide-y divide-slate-200">
          <thead className="bg-slate-50"><tr>
            {["Serviço", "Tipo", "Cobrança", "Horas", "Custo total", "Valor final", "Lucro", "Margem", "Visível", "Alertas", "Ações"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {services.map((service) => {
              const margin = Number(service.grossMarginPercent);
              const belowCost = Number(service.grossProfit) < 0;
              const lowMargin = !belowCost && Number(service.totalSalePrice) > 0 && margin < 15;
              return (
                <tr key={service.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{service.serviceName}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{serviceTypeLabels[service.serviceType]}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{pricingModeLabels[service.pricingMode]}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{service.pricingMode === GeneralServicePricingMode.HOURLY ? Number(service.estimatedHours).toLocaleString("pt-BR") : "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{formatCurrency(service.totalCost, currency)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{formatCurrency(service.totalSalePrice, currency)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{formatCurrency(service.grossProfit, currency)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {margin.toLocaleString("pt-BR", { maximumFractionDigits: 4 })}%
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{service.isVisibleToClient ? "Sim" : "Não"}</td>
                  <td className="px-4 py-3 text-xs"><div className="flex flex-wrap gap-1">
                    {belowCost ? <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">Serviço abaixo do custo</span> : lowMargin ? <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">Margem baixa</span> : null}
                    {!service.isVisibleToClient ? <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">Oculto</span> : null}
                  </div></td>
                  <td className="px-4 py-3"><div className="flex gap-2">
                    {editable ? <>
                      <button type="button" onClick={() => { setNotice(null); setEditingService(service); }} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Editar</button>
                      <DeleteServiceButton proposalId={proposalId} serviceId={service.id} />
                    </> : "—"}
                  </div></td>
                </tr>
              );
            })}
            {services.length === 0 ? <tr><td colSpan={11} className="px-4 py-8 text-center text-sm text-slate-500">Nenhum serviço adicionado.</td></tr> : null}
          </tbody>
        </table>
      </div>

      {editingService !== undefined ? (
        <ServiceForm
          key={editingService?.id ?? "new"}
          proposalId={proposalId}
          service={editingService}
          onSaved={handleSaved}
          onCancel={() => setEditingService(undefined)}
        />
      ) : null}
    </section>
  );
}
