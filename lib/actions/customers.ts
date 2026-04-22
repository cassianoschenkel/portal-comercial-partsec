"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations/customer";

export async function createCustomer(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    throw new Error("Usuário não autenticado.");
  }

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
      partnerId:
        session.user.role === UserRole.ADMIN ? null : session.user.id,
    },
  });

  revalidatePath("/dashboard/clientes");
  redirect("/dashboard/clientes");
}