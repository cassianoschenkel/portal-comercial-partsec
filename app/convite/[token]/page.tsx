import { notFound } from "next/navigation";

import { AcceptInvitationForm } from "@/components/invitations/accept-invitation-form";
import { hashInvitationToken } from "@/lib/invitations";
import { prisma } from "@/lib/prisma";

const roleLabels: Record<string, string> = {
  PARTNER_ADMIN: "Administrador do parceiro",
  PARTNER_SELLER: "Vendedor",
  PARTNER_VIEWER: "Visualizador",
};

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  const invitation = await prisma.userInvitation.findUnique({
    where: { tokenHash: hashInvitationToken(token) },
    select: {
      email: true,
      name: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
    },
  });

  const isInvalid =
    !invitation ||
    Boolean(invitation.acceptedAt) ||
    invitation.expiresAt <= new Date();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-soft">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Partsec
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            Aceitar convite
          </h1>
        </div>

        {isInvalid ? (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Convite inválido, expirado ou já utilizado.
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <p>
                <span className="font-medium">Nome:</span> {invitation.name}
              </p>
              <p className="mt-1">
                <span className="font-medium">E-mail:</span>{" "}
                {invitation.email}
              </p>
              <p className="mt-1">
                <span className="font-medium">Perfil:</span>{" "}
                {roleLabels[invitation.role] ?? invitation.role}
              </p>
            </div>

            <AcceptInvitationForm token={token} />
          </>
        )}
      </section>
    </main>
  );
}
