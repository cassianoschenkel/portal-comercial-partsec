"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations/customer";

export async function createCustomer(formData: FormData) {
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
    data: parsed.data,
  });

  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}

export async function updateCustomer(id: string, formData: FormData) {
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

  await prisma.customer.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({
    where: { id },
  });

  revalidatePath("/dashboard/clientes");
}
