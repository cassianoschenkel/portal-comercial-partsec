"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getEffectivePartnerId,
  getRequiredSession,
  isAdmin,
  requireCanCreateCustomer,
  requireCanUpdateCustomer,
  requirePartnerScope,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations/customer";

export async function createCustomer(formData: FormData) {
  const session = await getRequiredSession();
  requireCanCreateCustomer(session);

  const parsed = customerSchema.safeParse({
    companyName: formData.get("companyName"),
    tradeName: formData.get("tradeName"),
    document: formData.get("document"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Dados inválidos.");
  }

  await prisma.customer.create({
    data: {
      ...parsed.data,
      partnerId: isAdmin(session) ? null : requirePartnerScope(session),
    },
  });

  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}

export async function updateCustomer(id: string, formData: FormData) {
  const session = await getRequiredSession();
  requireCanUpdateCustomer(session);

  const parsed = customerSchema.safeParse({
    companyName: formData.get("companyName"),
    tradeName: formData.get("tradeName"),
    document: formData.get("document"),
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Dados inválidos.");
  }

  const customer = await prisma.customer.findFirst({
    where: {
      id,
      ...(isAdmin(session)
        ? {}
        : { partnerId: getEffectivePartnerId(session) ?? "" }),
    },
  });

  if (!customer) {
    throw new Error("Cliente não encontrado.");
  }

  await prisma.customer.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}

export async function deleteCustomer(id: string) {
  const session = await getRequiredSession();
  requireCanUpdateCustomer(session);

  const customer = await prisma.customer.findFirst({
    where: {
      id,
      ...(isAdmin(session)
        ? {}
        : { partnerId: getEffectivePartnerId(session) ?? "" }),
    },
  });

  if (!customer) {
    throw new Error("Cliente não encontrado.");
  }

  await prisma.customer.delete({
    where: { id },
  });

  revalidatePath("/dashboard/clientes");
}
