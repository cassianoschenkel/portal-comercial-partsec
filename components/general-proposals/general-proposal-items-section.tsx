"use client";

import { GeneralPricingMode } from "@prisma/client";
import type { FormEvent } from "react";
import { useActionState, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createGeneralProposalItem,
  deleteGeneralProposalItem,
  updateGeneralProposalItem,
  type GeneralProposalItemActionState,
} from "@/lib/actions/general-proposal-items";

type VendorOption = {
  id: string;
  name: string;
  isActive: boolean;
};

export type GeneralProposalItemView = {
  id: string;
  vendorId: string | null;
  sku: string | null;
  productName: string;
  description: string | null;
  category: string | null;
  quantity: string;
  licenseTermMonths: number | null;
  costUnitPrice: string;
  listUnitPrice: string;
  pricingMode: GeneralPricingMode;
  marginPercent: string;
  markupPercent: string;
  pricingMarkupPercent: string;
  discountPercent: string;
  saleUnitPrice: string;
  totalCost: string;
  finalItemPrice: string;
  grossProfit: string;
  grossMarginPercent: string;
  isVisibleToClient: boolean;
  internalNotes: string | null;
  sortOrder: number;
  vendor: { name: string } | null;
};

const initialState: GeneralProposalItemActionState = {
  success: false,
  error: null,
  message: null,
};

function formatCurrency(value: string, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(Number(value));
}

function ItemForm({
  proposalId,
  primaryVendorId,
  defaultLicenseTermMonths,
  vendors,
  item,
  onSaved,
  onCancel,
}: {
  proposalId: string;
  primaryVendorId: string;
  defaultLicenseTermMonths: number | null;
  vendors: VendorOption[];
  item: GeneralProposalItemView | null;
  onSaved: (message: string) => void;
  onCancel: () => void;
}) {
  const action = item
    ? updateGeneralProposalItem.bind(null, proposalId, item.id)
    : createGeneralProposalItem.bind(null, proposalId);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [pricingMode, setPricingMode] = useState<GeneralPricingMode>(
    item?.pricingMode ?? GeneralPricingMode.MARGIN
  );

  useEffect(() => {
    if (state.success && state.message) onSaved(state.message);
  }, [onSaved, state.message, state.success]);

  return (
    <form action={formAction} className="space-y-5 border-t border-slate-200 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-950">
            {item ? "Editar produto" : "Adicionar produto"}
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
        <div className="xl:col-span-2">
          <label htmlFor="productName" className="block text-sm font-medium text-slate-700">Produto</label>
          <input id="productName" name="productName" defaultValue={item?.productName ?? ""} required disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-slate-700">SKU</label>
          <input id="sku" name="sku" defaultValue={item?.sku ?? ""} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="vendorId" className="block text-sm font-medium text-slate-700">Fabricante</label>
          <select id="vendorId" name="vendorId" defaultValue={item?.vendorId ?? primaryVendorId} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100">
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}{vendor.isActive ? "" : " (inativo)"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">Categoria</label>
          <input id="category" name="category" defaultValue={item?.category ?? ""} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="licenseTermMonths" className="block text-sm font-medium text-slate-700">Prazo (meses)</label>
          <input id="licenseTermMonths" name="licenseTermMonths" type="number" min={1} step={1} defaultValue={item?.licenseTermMonths ?? defaultLicenseTermMonths ?? ""} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Quantidade</label>
          <input id="quantity" name="quantity" type="number" min="0.01" step="0.01" defaultValue={item?.quantity ?? "1"} required disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="costUnitPrice" className="block text-sm font-medium text-slate-700">Custo unitário</label>
          <input id="costUnitPrice" name="costUnitPrice" type="number" min="0" step="0.01" defaultValue={item?.costUnitPrice ?? "0"} required disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="listUnitPrice" className="block text-sm font-medium text-slate-700">Preço de lista</label>
          <input id="listUnitPrice" name="listUnitPrice" type="number" min="0" step="0.01" defaultValue={item?.listUnitPrice ?? "0"} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="pricingMode" className="block text-sm font-medium text-slate-700">Precificação</label>
          <select id="pricingMode" name="pricingMode" value={pricingMode} onChange={(event) => setPricingMode(event.target.value as GeneralPricingMode)} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100">
            <option value={GeneralPricingMode.MARGIN}>Margem</option>
            <option value={GeneralPricingMode.MARKUP}>Markup</option>
            <option value={GeneralPricingMode.MANUAL}>Manual</option>
          </select>
        </div>
        <div>
          <label htmlFor="marginPercent" className="block text-sm font-medium text-slate-700">Margem desejada (%)</label>
          <input id="marginPercent" name="marginPercent" type="number" min="0" max="99.9999" step="0.0001" defaultValue={item?.marginPercent ?? "0"} disabled={isPending || pricingMode !== GeneralPricingMode.MARGIN} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="markupPercent" className="block text-sm font-medium text-slate-700">Markup (%)</label>
          <input id="markupPercent" name="markupPercent" type="number" min="0" step="0.0001" defaultValue={item?.pricingMarkupPercent ?? "0"} disabled={isPending || pricingMode !== GeneralPricingMode.MARKUP} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="saleUnitPrice" className="block text-sm font-medium text-slate-700">Preço de venda manual</label>
          <input id="saleUnitPrice" name="saleUnitPrice" type="number" min="0" step="0.01" defaultValue={item?.saleUnitPrice ?? ""} required={pricingMode === GeneralPricingMode.MANUAL} disabled={isPending || pricingMode !== GeneralPricingMode.MANUAL} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="discountPercent" className="block text-sm font-medium text-slate-700">Desconto (%)</label>
          <input id="discountPercent" name="discountPercent" type="number" min="0" max="100" step="0.0001" defaultValue={item?.discountPercent ?? "0"} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-slate-700">Ordem</label>
          <input id="sortOrder" name="sortOrder" type="number" min={0} step={1} defaultValue={item?.sortOrder ?? 0} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
        <div className="md:col-span-2 xl:col-span-3">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descrição</label>
          <textarea id="description" name="description" rows={3} defaultValue={item?.description ?? ""} disabled={isPending} className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100" />
        </div>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
        <label htmlFor="internalNotes" className="block text-sm font-semibold text-amber-900">Notas internas do produto</label>
        <p className="mt-1 text-xs text-amber-700">Não serão exibidas ao cliente.</p>
        <textarea id="internalNotes" name="internalNotes" rows={3} defaultValue={item?.internalNotes ?? ""} disabled={isPending} className="mt-3 w-full rounded-md border border-amber-300 bg-white px-3 py-2 disabled:bg-slate-100" />
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
        <input name="isVisibleToClient" type="checkbox" defaultChecked={item?.isVisibleToClient ?? true} disabled={isPending} className="h-4 w-4 rounded border-slate-300" />
        Visível ao cliente
      </label>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={isPending} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancelar</button>
        <button type="submit" disabled={isPending} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
          {isPending ? "Salvando..." : item ? "Salvar alterações" : "Adicionar produto"}
        </button>
      </div>
    </form>
  );
}

function DeleteItemButton({ proposalId, itemId }: { proposalId: string; itemId: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    deleteGeneralProposalItem.bind(null, proposalId, itemId),
    initialState
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [router, state.success]);

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Remover este produto da proposta?")) event.preventDefault();
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

export function GeneralProposalItemsSection({
  proposalId,
  primaryVendorId,
  defaultLicenseTermMonths,
  currency,
  editable,
  items,
  vendors,
  analysis,
}: {
  proposalId: string;
  primaryVendorId: string;
  defaultLicenseTermMonths: number | null;
  currency: string;
  editable: boolean;
  items: GeneralProposalItemView[];
  vendors: VendorOption[];
  analysis: {
    count: number;
    totalCost: string;
    totalSale: string;
    grossProfit: string;
    grossMarginPercent: string;
    lowestMarginName: string | null;
    lowestMarginPercent: string | null;
    negativeCount: number;
  };
}) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<GeneralProposalItemView | null | undefined>();
  const [notice, setNotice] = useState<string | null>(null);
  const handleSaved = useCallback((message: string) => {
    setNotice(message);
    setEditingItem(undefined);
    router.refresh();
  }, [router]);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Produtos e licenças</h2>
          <p className="mt-1 text-sm text-slate-600">Itens manuais e seus valores financeiros.</p>
        </div>
        {editable ? (
          <button type="button" onClick={() => { setNotice(null); setEditingItem(null); }} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Adicionar produto
          </button>
        ) : null}
      </div>

      {notice ? <div className="mx-6 mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</div> : null}
      {!editable ? <div className="mx-6 mb-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">Esta proposta está em modo somente leitura para produtos.</div> : null}

      <div className="grid gap-3 border-t border-slate-200 bg-slate-50/60 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          ["Itens", String(analysis.count)],
          ["Custo", formatCurrency(analysis.totalCost, currency)],
          ["Venda final", formatCurrency(analysis.totalSale, currency)],
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
        {analysis.negativeCount > 0 ? (
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-6 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
            {analysis.negativeCount} item(ns) com margem negativa.
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto border-t border-slate-200">
        <table className="min-w-[1350px] divide-y divide-slate-200">
          <thead className="bg-slate-50"><tr>
            {["Produto", "SKU", "Fabricante", "Quantidade", "Prazo", "Custo total", "Valor final", "Lucro", "Margem", "Visível", "Alertas", "Ações"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.productName}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.sku || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.vendor?.name || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{Number(item.quantity).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.licenseTermMonths ? `${item.licenseTermMonths} meses` : "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{formatCurrency(item.totalCost, currency)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{formatCurrency(item.finalItemPrice, currency)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{formatCurrency(item.grossProfit, currency)}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{Number(item.grossMarginPercent).toLocaleString("pt-BR", { maximumFractionDigits: 4 })}%</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.isVisibleToClient ? "Sim" : "Não"}</td>
                <td className="px-4 py-3 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {!item.sku ? <span className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700">Sem SKU</span> : null}
                    {Number(item.grossProfit) < 0 ? <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">Margem negativa</span> : Number(item.finalItemPrice) > 0 && Number(item.grossMarginPercent) < 15 ? <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">Margem baixa</span> : null}
                    {!item.isVisibleToClient ? <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">Oculto</span> : null}
                  </div>
                </td>
                <td className="px-4 py-3"><div className="flex gap-2">
                  {editable ? <>
                    <button type="button" onClick={() => { setNotice(null); setEditingItem(item); }} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Editar</button>
                    <DeleteItemButton proposalId={proposalId} itemId={item.id} />
                  </> : "—"}
                </div></td>
              </tr>
            ))}
            {items.length === 0 ? <tr><td colSpan={12} className="px-4 py-8 text-center text-sm text-slate-500">Nenhum produto adicionado.</td></tr> : null}
          </tbody>
        </table>
      </div>

      {editingItem !== undefined ? (
        <ItemForm
          key={editingItem?.id ?? "new"}
          proposalId={proposalId}
          primaryVendorId={primaryVendorId}
          defaultLicenseTermMonths={defaultLicenseTermMonths}
          vendors={vendors}
          item={editingItem}
          onSaved={handleSaved}
          onCancel={() => setEditingItem(undefined)}
        />
      ) : null}
    </section>
  );
}
