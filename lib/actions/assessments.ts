"use server";

import { AssessmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { assessmentScopeWhere } from "@/lib/assessments/access";
import {
  createAssessmentToken,
  hashAssessmentToken,
  isWellFormedAssessmentToken,
} from "@/lib/assessments/tokens";
import {
  canManageAssessmentLink,
  getEffectivePartnerId,
  getRequiredSession,
  isAdmin,
  requireCanCreateAssessment,
  requireCanManageAssessmentLink,
  requirePartnerScope,
} from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import {
  createAssessmentSchema,
  parsePublicAssessmentAnswers,
} from "@/lib/validations/assessment";

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function getAssessmentForCurrentUser(id: string) {
  const session = await getRequiredSession();

  const assessment = await prisma.assessment.findFirst({
    where: {
      id,
      ...assessmentScopeWhere(session),
    },
    include: {
      customer: { select: { partnerId: true } },
    },
  });

  return { session, assessment };
}

export async function createAssessment(formData: FormData) {
  const session = await getRequiredSession();
  requireCanCreateAssessment(session);

  const parsed = createAssessmentSchema.safeParse({
    customerId: formData.get("customerId"),
    title: formData.get("title"),
    type: formData.get("type"),
    validityDays: formData.get("validityDays"),
    internalNotes: formData.get("internalNotes"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Dados inválidos.");
  }

  const customer = await prisma.customer.findFirst({
    where: {
      id: parsed.data.customerId,
      ...(isAdmin(session)
        ? {}
        : { partnerId: requirePartnerScope(session) }),
    },
    select: {
      id: true,
      partnerId: true,
    },
  });

  if (!customer) {
    throw new Error("Cliente inválido para este usuário.");
  }

  const assessmentPartnerId = isAdmin(session)
    ? customer.partnerId
    : getEffectivePartnerId(session);

  const assessment = await prisma.assessment.create({
    data: {
      customerId: customer.id,
      partnerId: assessmentPartnerId,
      createdByUserId: session.user.id,
      title: parsed.data.title,
      type: parsed.data.type,
      status: AssessmentStatus.DRAFT,
      tokenExpiresAt: addDays(parsed.data.validityDays),
      internalNotes: parsed.data.internalNotes || null,
    },
    select: { id: true },
  });

  const tokenData = createAssessmentToken(assessment.id);

  await prisma.assessment.update({
    where: { id: assessment.id },
    data: {
      tokenHash: tokenData.tokenHash,
      tokenNonce: tokenData.nonce,
      status: AssessmentStatus.SENT,
    },
  });

  revalidatePath("/dashboard/assessments");
  redirect(`/dashboard/assessments/${assessment.id}`);
}

export async function regenerateAssessmentLink(id: string, formData: FormData) {
  const { session, assessment } = await getAssessmentForCurrentUser(id);
  requireCanManageAssessmentLink(session);

  if (!assessment) {
    throw new Error("Assessment não encontrado.");
  }

  if (assessment.status === AssessmentStatus.SUBMITTED) {
    throw new Error("Assessment submetido não pode ter link regenerado.");
  }

  const validityDays = Number(formData.get("validityDays") || 15);
  const expiresAt = addDays(
    Number.isFinite(validityDays) && validityDays > 0 ? validityDays : 15
  );
  const tokenData = createAssessmentToken(assessment.id);

  await prisma.assessment.update({
    where: { id: assessment.id },
    data: {
      tokenHash: tokenData.tokenHash,
      tokenNonce: tokenData.nonce,
      tokenExpiresAt: expiresAt,
      status: AssessmentStatus.SENT,
    },
  });

  revalidatePath("/dashboard/assessments");
  revalidatePath(`/dashboard/assessments/${assessment.id}`);
}

export async function cancelAssessment(id: string) {
  const { session, assessment } = await getAssessmentForCurrentUser(id);

  if (!canManageAssessmentLink(session)) {
    throw new Error("Você não tem permissão para cancelar assessments.");
  }

  if (!assessment) {
    throw new Error("Assessment não encontrado.");
  }

  await prisma.assessment.update({
    where: { id: assessment.id },
    data: {
      status: AssessmentStatus.CANCELLED,
      tokenHash: null,
      tokenNonce: null,
    },
  });

  revalidatePath("/dashboard/assessments");
  revalidatePath(`/dashboard/assessments/${assessment.id}`);
}

export async function submitPublicAssessment(formData: FormData) {
  const token = String(formData.get("token") || "");

  if (!token || !isWellFormedAssessmentToken(token)) {
    throw new Error("Link inválido.");
  }

  const tokenHash = hashAssessmentToken(token);
  const assessment = await prisma.assessment.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      status: true,
      tokenExpiresAt: true,
    },
  });

  if (!assessment) {
    throw new Error("Link inválido.");
  }

  if (assessment.status === AssessmentStatus.SUBMITTED) {
    redirect(`/assessment/${token}`);
  }

  if (assessment.status === AssessmentStatus.CANCELLED) {
    throw new Error("Este levantamento foi cancelado.");
  }

  if (
    assessment.status === AssessmentStatus.EXPIRED ||
    (assessment.tokenExpiresAt && assessment.tokenExpiresAt < new Date())
  ) {
    await prisma.assessment.update({
      where: { id: assessment.id },
      data: { status: AssessmentStatus.EXPIRED },
    });
    throw new Error("Este link expirou.");
  }

  const parsed = parsePublicAssessmentAnswers(formData);

  await prisma.assessment.update({
    where: { id: assessment.id },
    data: {
      status: AssessmentStatus.SUBMITTED,
      submittedAt: new Date(),
      submittedByName: parsed.submittedByName,
      submittedByEmail: parsed.submittedByEmail,
      submittedByPhone: parsed.submittedByPhone,
      answers: parsed.answers,
    },
  });

  revalidatePath("/dashboard/assessments");
  revalidatePath(`/dashboard/assessments/${assessment.id}`);
  redirect(`/assessment/${token}?submitted=1`);
}
