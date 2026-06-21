import { VendorForm } from "@/components/vendors/vendor-form";
import { createVendor } from "@/lib/actions/vendors";
import {
  getRequiredSession,
  requireCanAccessGeneralProposals,
} from "@/lib/authz";

export default async function NewVendorPage() {
  const session = await getRequiredSession();
  requireCanAccessGeneralProposals(session);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">
          Novo fabricante
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Cadastre um fabricante para uso nas Propostas Gerais.
        </p>
      </div>

      <VendorForm action={createVendor} submitLabel="Salvar fabricante" />
    </div>
  );
}
