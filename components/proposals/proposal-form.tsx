"use client";

import { Fragment, useState } from "react";

import {
  PROPOSAL_MODULE_OPTIONS,
  PROPOSAL_PLAN_OPTIONS,
  getProposalModuleOption,
  type ProposalModuleOptionValue,
} from "@/lib/proposals/catalog";

type CustomerOption = {
  id: string;
  companyName: string;
  tradeName: string | null;
};

type ProposalModuleRow = {
  id: string;
  moduleType: ProposalModuleOptionValue;
  quantity: string;
  pricingMode: "AUTO" | "MANUAL";
  manualMonthlyPrice: string;
  manualSetupPrice: string;
  pricingJustification: string;
};

type Props = {
  customers: CustomerOption[];
  action: (formData: FormData) => void | Promise<void>;
};

const INITIAL_MODULE_TYPE = PROPOSAL_MODULE_OPTIONS[0].value;

function createModuleRow(
  moduleType: ProposalModuleOptionValue = INITIAL_MODULE_TYPE
): ProposalModuleRow {
  return {
    id: `${moduleType}-${Math.random().toString(36).slice(2, 10)}`,
    moduleType,
    quantity: "",
    pricingMode: "AUTO",
    manualMonthlyPrice: "",
    manualSetupPrice: "",
    pricingJustification: "",
  };
}

export function ProposalForm({ customers, action }: Props) {
  const [modules, setModules] = useState<ProposalModuleRow[]>([
    createModuleRow(),
  ]);
  const [discountPercent, setDiscountPercent] = useState("0");
  const [moduleError, setModuleError] = useState<string | null>(null);

  const selectedModuleTypes = new Set(
    modules.map((module) => module.moduleType)
  );

  const availableModuleOptions = PROPOSAL_MODULE_OPTIONS.filter((option) => {
    return !selectedModuleTypes.has(option.value);
  });

  function updateModule(
    rowId: string,
    field:
      | "moduleType"
      | "quantity"
      | "pricingMode"
      | "manualMonthlyPrice"
      | "manualSetupPrice"
      | "pricingJustification",
    value: string
  ) {
    setModules((current) =>
      current.map((module) =>
        module.id === rowId ? { ...module, [field]: value } : module
      )
    );
    setModuleError(null);
  }

  function addModule() {
    const nextOption = PROPOSAL_MODULE_OPTIONS.find((option) => {
      return !selectedModuleTypes.has(option.value);
    });

    if (!nextOption) {
      return;
    }

    setModules((current) => [...current, createModuleRow(nextOption.value)]);
    setModuleError(null);
  }

  function removeModule(rowId: string) {
    setModules((current) => {
      if (current.length === 1) {
        setModuleError("Informe ao menos um módulo.");
        return current;
      }

      return current.filter((module) => module.id !== rowId);
    });
  }

  function validateModules() {
    if (modules.length === 0) {
      setModuleError("Informe ao menos um módulo.");
      return false;
    }

    const hasInvalidQuantity = modules.some((module) => {
      return !module.quantity || Number(module.quantity) <= 0;
    });

    if (hasInvalidQuantity) {
      setModuleError("Todas as quantidades devem ser maiores que zero.");
      return false;
    }

    const uniqueModules = new Set(modules.map((module) => module.moduleType));

    if (uniqueModules.size !== modules.length) {
      setModuleError("Não é permitido repetir o mesmo módulo na proposta.");
      return false;
    }

    const invalidManualPricing = modules.find((module) => {
      if (module.pricingMode !== "MANUAL") {
        return false;
      }

      return (
        module.manualMonthlyPrice === "" ||
        Number(module.manualMonthlyPrice) < 0 ||
        module.manualSetupPrice === "" ||
        Number(module.manualSetupPrice) < 0 ||
        !module.pricingJustification.trim()
      );
    });

    if (invalidManualPricing) {
      setModuleError(
        "Para preço customizado, informe mensalidade, setup e justificativa interna."
      );
      return false;
    }

    setModuleError(null);
    return true;
  }

  const modulesJson = JSON.stringify(
    modules.map((module) => ({
      moduleType: module.moduleType,
      quantity: Number(module.quantity || 0),
      pricingMode: module.pricingMode,
      manualMonthlyPrice:
        module.pricingMode === "MANUAL" && module.manualMonthlyPrice !== ""
          ? Number(module.manualMonthlyPrice)
          : undefined,
      manualSetupPrice:
        module.pricingMode === "MANUAL" && module.manualSetupPrice !== ""
          ? Number(module.manualSetupPrice)
          : undefined,
      pricingJustification:
        module.pricingMode === "MANUAL"
          ? module.pricingJustification.trim()
          : undefined,
    }))
  );

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!validateModules()) {
          event.preventDefault();
        }
      }}
      className="space-y-6 rounded-lg border border-slate-200 bg-white p-6"
    >
      <input type="hidden" name="modulesJson" value={modulesJson} />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="customerId"
            className="block text-sm font-medium text-slate-700"
          >
            Cliente
          </label>
          <select
            id="customerId"
            name="customerId"
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            defaultValue=""
          >
            <option value="" disabled>
              Selecione um cliente
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.companyName}
                {customer.tradeName ? ` (${customer.tradeName})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-slate-700"
          >
            Título da proposta
          </label>
          <input
            id="title"
            name="title"
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Proposta Partsec One - Cliente X"
          />
        </div>

        <div>
          <label
            htmlFor="plan"
            className="block text-sm font-medium text-slate-700"
          >
            Plano
          </label>
          <select
            id="plan"
            name="plan"
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            defaultValue={PROPOSAL_PLAN_OPTIONS[0].value}
          >
            {PROPOSAL_PLAN_OPTIONS.map((plan) => (
              <option key={plan.value} value={plan.value}>
                {plan.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="discountPercent"
            className="block text-sm font-medium text-slate-700"
          >
            Desconto autorizado (%)
          </label>
          <input
            id="discountPercent"
            name="discountPercent"
            type="number"
            min={0}
            max={10}
            step="0.01"
            defaultValue={0}
            required
            onChange={(event) => setDiscountPercent(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Módulos monitorados
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Adicione os módulos e informe a quantidade correspondente.
            </p>
          </div>

          <button
            type="button"
            onClick={addModule}
            disabled={availableModuleOptions.length === 0}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Adicionar módulo
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Módulo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quantidade
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Unidade
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Precificação
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ação
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {modules.map((module) => {
                const currentOption = getProposalModuleOption(module.moduleType);

                return (
                  <Fragment key={module.id}>
                      <tr>
                        <td className="px-4 py-3">
                          <select
                            value={module.moduleType}
                            onChange={(event) =>
                              updateModule(
                                module.id,
                                "moduleType",
                                event.target.value
                              )
                            }
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                          >
                            {PROPOSAL_MODULE_OPTIONS.filter((option) => {
                              return (
                                option.value === module.moduleType ||
                                !selectedModuleTypes.has(option.value)
                              );
                            }).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={1}
                            required
                            value={module.quantity}
                            onChange={(event) =>
                              updateModule(
                                module.id,
                                "quantity",
                                event.target.value
                              )
                            }
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Informe a quantidade"
                          />
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-700">
                          {currentOption?.unitLabel ?? "-"}
                        </td>

                        <td className="px-4 py-3">
                          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={module.pricingMode === "MANUAL"}
                              onChange={(event) =>
                                updateModule(
                                  module.id,
                                  "pricingMode",
                                  event.target.checked ? "MANUAL" : "AUTO"
                                )
                              }
                              className="h-4 w-4 rounded border-slate-300 text-slate-900"
                            />
                            Usar preço customizado
                          </label>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeModule(module.id)}
                            className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            Remover
                          </button>
                        </td>
                      </tr>

                      {module.pricingMode === "MANUAL" ? (
                        <tr key={`${module.id}-manual`}>
                          <td colSpan={5} className="bg-amber-50 px-4 py-4">
                            <div className="grid gap-4 md:grid-cols-3">
                              <div>
                                <label className="block text-sm font-medium text-amber-950">
                                  Preço mensal customizado
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={module.manualMonthlyPrice}
                                  onChange={(event) =>
                                    updateModule(
                                      module.id,
                                      "manualMonthlyPrice",
                                      event.target.value
                                    )
                                  }
                                  className="mt-2 w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm"
                                  placeholder="0,00"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-amber-950">
                                  Setup customizado
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={module.manualSetupPrice}
                                  onChange={(event) =>
                                    updateModule(
                                      module.id,
                                      "manualSetupPrice",
                                      event.target.value
                                    )
                                  }
                                  className="mt-2 w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm"
                                  placeholder="0,00"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-amber-950">
                                  Justificativa interna da precificação
                                </label>
                                <textarea
                                  value={module.pricingJustification}
                                  onChange={(event) =>
                                    updateModule(
                                      module.id,
                                      "pricingJustification",
                                      event.target.value
                                    )
                                  }
                                  rows={3}
                                  className="mt-2 w-full rounded-md border border-amber-300 bg-white px-3 py-2 text-sm"
                                />
                              </div>
                            </div>

                            <p className="mt-3 text-sm text-amber-800">
                              Use preço customizado quando a quantidade de
                              ativos não refletir a complexidade operacional do
                              ambiente, como clientes enterprise, alto volume de
                              logs, alta criticidade ou necessidade de
                              acompanhamento diferenciado.
                            </p>
                          </td>
                        </tr>
                      ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {moduleError ? (
          <p className="text-sm font-medium text-red-600">{moduleError}</p>
        ) : null}
      </section>

      <section className="grid gap-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Módulos selecionados
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">
            {modules.length}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Desconto informado
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-950">
            {discountPercent || "0"}%
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Regra de cálculo
          </p>
          <p className="mt-1 text-sm text-slate-700">
            O cálculo final será aplicado conforme a tabela de preços vigente.
          </p>
        </div>
      </section>

      <div>
        <label
          htmlFor="scopeDescription"
          className="block text-sm font-medium text-slate-700"
        >
          Escopo desta proposta
        </label>
        <textarea
          id="scopeDescription"
          name="scopeDescription"
          className="mt-2 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2"
          placeholder="Descreva de forma objetiva o escopo específico desta proposta para o cliente."
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-slate-700"
        >
          Observações
        </label>
        <textarea
          id="notes"
          name="notes"
          className="mt-2 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Gerar proposta
        </button>
      </div>
    </form>
  );
}
