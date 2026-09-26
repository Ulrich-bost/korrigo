import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@univ-sujets.fr" },
    update: {},
    create: {
      email: "admin@univ-sujets.fr",
      name: "Administrateur",
      passwordHash,
      role: "ADMIN",
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@univ-sujets.fr" },
    update: {},
    create: {
      email: "demo@univ-sujets.fr",
      name: "Étudiant Demo",
      passwordHash: await bcrypt.hash("demo1234", 12),
    },
  });

  await prisma.subscription.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      plan: "YEARLY",
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.favorite.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.university.deleteMany();
  await prisma.university.create({
    data: { name: "Université de Blida 1", slug: "universite-blida-1", city: "Blida" },
  });

  console.log("Seed terminé : anciens sujets retirés, Université de Blida 1 enregistrée.");
  console.log("Admin: admin@univ-sujets.fr / admin123");
  console.log("Demo (abonné): demo@univ-sujets.fr / demo1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
