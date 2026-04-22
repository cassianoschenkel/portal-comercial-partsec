import { CustomerForm } from "@/components/customers/customer-form";
import { createCustomer } from "@/lib/actions/customers";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Novo cliente</h1>
        <p className="mt-1 text-sm text-slate-600">
          Cadastre um novo cliente para geração de propostas.
        </p>
      </div>

      <CustomerForm action={createCustomer} submitLabel="Salvar cliente" />
    </div>
  );
}
