import { slugify } from "@/lib/utils";

export const STUDY_LEVELS = ["L1", "L2", "L3", "M1", "M2"] as const;

export const CATALOG = [
  {
    name: "Faculté des sciences",
    filieres: [
      "Informatique",
      "Mathématiques",
      "Chimie analytique",
      "Chimie organique",
      "Physique",
      "Tronc commun",
    ],
  },
  {
    name: "Faculté des sciences de la nature et de la vie",
    filieres: ["Biologie", "Biotechnologie", "Sciences alimentaires", "Tronc commun"],
  },
  {
    name: "Faculté de technologie",
    filieres: [
      "Génie civil",
      "Génie des procédés",
      "Génie mécanique",
      "Sciences de l'eau et de l'environnement",
      "Électronique",
      "Énergies renouvelables",
      "Automatique et électrotechnique",
      "Tronc commun sciences et technologie (LMD)",
      "Tronc commun sciences et technologie (ingénieur)",
    ],
  },
  {
    name: "Faculté de médecine",
    filieres: ["Médecine", "Pharmacie", "Médecine dentaire"],
  },
  {
    name: "Institut des sciences vétérinaires",
    filieres: ["Phase préclinique", "Phase clinique", "Médecine, chirurgie et reproduction animale"],
  },
  {
    name: "Institut des sciences et techniques appliquées",
    filieres: [
      "Technologie du lait et dérivés",
      "Technologie des céréales et dérivés",
      "Technologie de l'eau et des boissons",
      "Techniques de commercialisation en sciences alimentaires",
    ],
  },
  {
    name: "Institut d'architecture et d'urbanisme",
    filieres: ["Architecture", "Urbanisme", "Patrimoine"],
  },
  {
    name: "Institut d'aéronautique et des études spatiales",
    filieres: ["Construction aéronautique", "Navigation aérienne", "Études spatiales", "Tronc commun"],
  },
] as const;
export type StudyLevel = (typeof STUDY_LEVELS)[number];

export function isStudyLevel(value: string): value is StudyLevel {
  return (STUDY_LEVELS as readonly string[]).includes(value);
}

export function formatLevel(level: string) {
  return isStudyLevel(level) ? level : level;
}

export function departmentSlug(name: string) {
  return slugify(name);
}

export function filiereSlug(name: string) {
  return slugify(name);
}

export function findBySlug<T extends string>(names: T[], slug: string | undefined) {
  if (!slug) return undefined;
  return names.find((name) => slugify(name) === slug);
}
