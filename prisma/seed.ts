import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
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
      plan: "MONTHLY",
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const universities = [
    { name: "Sorbonne Université", slug: "sorbonne-universite", city: "Paris" },
    { name: "Université Paris-Saclay", slug: "universite-paris-saclay", city: "Paris" },
    { name: "Université Lyon 1", slug: "universite-lyon-1", city: "Lyon" },
    { name: "Université Bordeaux", slug: "universite-bordeaux", city: "Bordeaux" },
    { name: "Aix-Marseille Université", slug: "aix-marseille-universite", city: "Marseille" },
  ];

  for (const uni of universities) {
    await prisma.university.upsert({
      where: { slug: uni.slug },
      update: {},
      create: uni,
    });
  }

  const allUnis = await prisma.university.findMany();
  const subjects = [
    {
      title: "Analyse — Série de fonctions et intégrales",
      slug: "analyse-serie-fonctions-integrales-sorbonne-2025",
      description: "Partiel de L2 Mathématiques. Convergence uniforme, théorème de convergence dominée.",
      universitySlug: "sorbonne-universite",
      faculty: "Mathématiques",
      level: "2",
      year: 2025,
      semester: "S1",
      examType: "Partiel",
    },
    {
      title: "Algèbre linéaire — Espaces vectoriels et applications linéaires",
      slug: "algebre-lineaire-l1-saclay-2025",
      description: "Examen final L1. Bases, dimension, matrices, systèmes linéaires.",
      universitySlug: "universite-paris-saclay",
      faculty: "Mathématiques",
      level: "1",
      year: 2025,
      semester: "S2",
      examType: "Final",
    },
    {
      title: "Physique — Mécanique du point et électrocinétique",
      slug: "physique-mecanique-electrocinetique-lyon-2024",
      description: "Partiel L1 Physique. Lois de Newton, circuits RC et RL.",
      universitySlug: "universite-lyon-1",
      faculty: "Physique",
      level: "1",
      year: 2024,
      semester: "S1",
      examType: "Partiel",
    },
    {
      title: "Droit civil — Les obligations et la responsabilité",
      slug: "droit-civil-obligations-bordeaux-2025",
      description: "Examen L2 Droit. Responsabilité contractuelle et délictuelle.",
      universitySlug: "universite-bordeaux",
      faculty: "Droit",
      level: "2",
      year: 2025,
      semester: "S2",
      examType: "Final",
    },
    {
      title: "Informatique — Structures de données et algorithmes",
      slug: "info-structures-donnees-marseille-2025",
      description: "Partiel L3 Informatique. Arbres, graphes, complexité algorithmique.",
      universitySlug: "aix-marseille-universite",
      faculty: "Informatique",
      level: "3",
      year: 2025,
      semester: "S1",
      examType: "Partiel",
    },
    {
      title: "Économie — Microéconomie et théorie du consommateur",
      slug: "economie-microeconomie-saclay-2024",
      description: "Final L2 Économie. Utilité, budget, équilibre de marché.",
      universitySlug: "universite-paris-saclay",
      faculty: "Économie",
      level: "2",
      year: 2024,
      semester: "S2",
      examType: "Final",
      isPremium: false,
    },
    {
      title: "Chimie organique — Réactions et mécanismes",
      slug: "chimie-organique-sorbonne-2024",
      description: "Partiel L2 Chimie. SN1, SN2, élimination, spectroscopie IR.",
      universitySlug: "sorbonne-universite",
      faculty: "Chimie",
      level: "2",
      year: 2024,
      semester: "S1",
      examType: "Partiel",
    },
    {
      title: "Statistiques — Probabilités et inférence",
      slug: "statistiques-probabilites-lyon-2025",
      description: "Final L3 Mathématiques appliquées. Lois, estimateurs, tests d'hypothèses.",
      universitySlug: "universite-lyon-1",
      faculty: "Mathématiques",
      level: "3",
      year: 2025,
      semester: "S2",
      examType: "Final",
    },
  ];

  for (const s of subjects) {
    const uni = allUnis.find((u) => u.slug === s.universitySlug);
    if (!uni) continue;

    const { universitySlug, isPremium, ...data } = s;
    await prisma.subject.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        ...data,
        universityId: uni.id,
        isPremium: isPremium ?? true,
      },
    });
  }

  console.log("Seed terminé !");
  console.log(`Admin: admin@univ-sujets.fr / admin123`);
  console.log(`Demo (abonné): demo@univ-sujets.fr / demo1234`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
