import { PartnerForm } from "@/components/partners/partner-form";
import { createPartner } from "@/lib/actions/partners";

export default function NewPartnerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Novo parceiro</h1>
        <p className="mt-1 text-sm text-slate-600">
          Cadastre um novo parceiro comercial no portal.
        </p>
      </div>

      <PartnerForm action={createPartner} submitLabel="Salvar parceiro" />
    </div>
  );
}