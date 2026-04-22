"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  CustomerFormState,
  parseCustomerFormData
} from "@/lib/customer-validation";
import { prisma } from "@/lib/prisma";

function friendlyError(error: unknown) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "Ja existe um cliente com este documento.";
  }

  return "Nao foi possivel salvar o cliente. Tente novamente.";
}

export async function createCustomerAction(
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const parsed = parseCustomerFormData(formData);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let customerId: string;

  try {
    const customer = await prisma.customer.create({
      data: parsed.data
    });

    customerId = customer.id;
    revalidatePath("/clientes");
  } catch (error) {
    return { error: friendlyError(error) };
  }

  redirect(`/clientes/${customerId}`);
}

export async function updateCustomerAction(
  id: string,
  _prevState: CustomerFormState,
  formData: FormData
): Promise<CustomerFormState> {
  const parsed = parseCustomerFormData(formData);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.customer.update({
      where: { id },
      data: parsed.data
    });

    revalidatePath("/clientes");
    revalidatePath(`/clientes/${id}`);
  } catch (error) {
    return { error: friendlyError(error) };
  }

  redirect(`/clientes/${id}`);
}

export async function deleteCustomerAction(id: string) {
  await prisma.customer.delete({
    where: { id }
  });

  revalidatePath("/clientes");
  redirect("/clientes");
}
