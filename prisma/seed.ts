import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  const partnerPasswordHash = await bcrypt.hash("parceiro123", 12);

  await prisma.user.upsert({
    where: { email: "admin@partsec.com.br" },
    update: {},
    create: {
      name: "Admin Partsec",
      email: "admin@partsec.com.br",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN
    }
  });

//  await prisma.user.upsert({
//    where: { email: "parceiro@partsec.com.br" },
 //   update: {},
//    create: {
//      name: "Parceiro Teste",
//      email: "parceiro@partsec.com.br",
//      passwordHash: partnerPasswordHash,
//      role: UserRole.PARTNER
//    }
//  });
await prisma.user.upsert({
  where: { email: "admin@partsec.com.br" },
  update: {
    passwordHash: adminPasswordHash,
    name: "Admin Partsec",
    role: UserRole.ADMIN
  },
  create: {
    name: "Admin Partsec",
    email: "admin@partsec.com.br",
    passwordHash: adminPasswordHash,
    role: UserRole.ADMIN
  }
});

  await prisma.customer.upsert({
    where: { document: "12.345.678/0001-90" },
    update: {},
    create: {
      companyName: "Acme Tecnologia Ltda",
      tradeName: "Acme Tech",
      document: "12.345.678/0001-90",
      contactName: "Marina Costa",
      contactEmail: "marina.costa@acmetech.com.br",
      contactPhone: "(11) 98888-0001",
      notes: "Cliente com interesse em monitoramento contínuo."
    }
  });

  await prisma.customer.upsert({
    where: { document: "98.765.432/0001-10" },
    update: {},
    create: {
      companyName: "Norte Serviços Financeiros S.A.",
      tradeName: "Norte Finance",
      document: "98.765.432/0001-10",
      contactName: "Eduardo Ramos",
      contactEmail: "eduardo.ramos@nortefinance.com.br",
      contactPhone: "(21) 97777-0002",
      notes: "Precisa de proposta para 250 ativos."
    }
  });

  await prisma.customer.upsert({
    where: { document: "45.111.222/0001-33" },
    update: {},
    create: {
      companyName: "Serra Logistica Integrada Ltda",
      tradeName: "Serra Log",
      document: "45.111.222/0001-33",
      contactName: "Patricia Lima",
      contactEmail: "patricia.lima@serralog.com.br",
      contactPhone: "(31) 96666-0003",
      notes: "Parceiro pediu retorno apos apresentacao comercial."
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
