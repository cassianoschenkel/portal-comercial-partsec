"use server";

import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  createPartnerSchema,
  updatePartnerSchema,
} from "@/lib/validations/partner";

export async function createPartner(formData: FormData) {
  const parsed = createPartnerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    companyName: formData.get("companyName"),
    phone: formData.get("phone"),
    commissionPercent: formData.get("commissionPercent"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Dados inválidos.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });

  if (existingUser) {
    throw new Error("Já existe um usuário com este e-mail.");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase().trim(),
      passwordHash,
      role: UserRole.PARTNER,
      companyName: parsed.data.companyName || null,
      phone: parsed.data.phone || null,
      commissionPercent: parsed.data.commissionPercent,
      isActive: parsed.data.isActive ?? false,
    },
  });

  revalidatePath("/dashboard/parceiros");
  redirect("/dashboard/parceiros");
}

export async function updatePartner(id: string, formData: FormData) {
  const parsed = updatePartnerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    companyName: formData.get("companyName"),
    phone: formData.get("phone"),
    commissionPercent: formData.get("commissionPercent"),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Dados inválidos.");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      email: parsed.data.email.toLowerCase().trim(),
      NOT: { id },
    },
  });

  if (existingUser) {
    throw new Error("Já existe outro usuário com este e-mail.");
  }

  const data: {
    name: string;
    email: string;
    companyName: string | null;
    phone: string | null;
    commissionPercent: number;
    isActive: boolean;
    passwordHash?: string;
  } = {
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase().trim(),
    companyName: parsed.data.companyName || null,
    phone: parsed.data.phone || null,
    commissionPercent: parsed.data.commissionPercent,
    isActive: parsed.data.isActive ?? false,
  };

  if (parsed.data.password) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  }

  await prisma.user.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/parceiros");
  redirect("/dashboard/parceiros");
}

export async function deletePartner(id: string) {
  const proposalCount = await prisma.proposal.count({
    where: { partnerId: id },
  });

  if (proposalCount > 0) {
    throw new Error(
      "Este parceiro possui propostas vinculadas e não pode ser excluído."
    );
  }

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/dashboard/parceiros");
}