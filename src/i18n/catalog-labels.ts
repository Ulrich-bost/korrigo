import type { Locale } from "@/i18n/config";

const LABELS: Record<string, { en: string; ar: string }> = {
  "Faculté des sciences": { en: "Faculty of Science", ar: "كلية العلوم" },
  "Faculté des sciences de la nature et de la vie": {
    en: "Faculty of Natural and Life Sciences",
    ar: "كلية علوم الطبيعة والحياة",
  },
  "Faculté de technologie": { en: "Faculty of Technology", ar: "كلية التكنولوجيا" },
  "Faculté de médecine": { en: "Faculty of Medicine", ar: "كلية الطب" },
  "Institut des sciences vétérinaires": {
    en: "Institute of Veterinary Sciences",
    ar: "معهد العلوم البيطرية",
  },
  "Institut des sciences et techniques appliquées": {
    en: "Institute of Applied Sciences and Techniques",
    ar: "معهد العلوم والتقنيات التطبيقية",
  },
  "Institut d'architecture et d'urbanisme": {
    en: "Institute of Architecture and Urban Planning",
    ar: "معهد الهندسة المعمارية والتعمير",
  },
  "Institut d'aéronautique et des études spatiales": {
    en: "Institute of Aeronautics and Space Studies",
    ar: "معهد الطيران والدراسات الفضائية",
  },
  Informatique: { en: "Computer science", ar: "الإعلام الآلي" },
  Mathématiques: { en: "Mathematics", ar: "الرياضيات" },
  "Chimie analytique": { en: "Analytical chemistry", ar: "الكيمياء التحليلية" },
  "Chimie organique": { en: "Organic chemistry", ar: "الكيمياء العضوية" },
  Physique: { en: "Physics", ar: "الفيزياء" },
  "Tronc commun": { en: "Common core", ar: "الجذع المشترك" },
  Biologie: { en: "Biology", ar: "البيولوجيا" },
  Biotechnologie: { en: "Biotechnology", ar: "البيوتكنولوجيا" },
  "Sciences alimentaires": { en: "Food sciences", ar: "علوم الغذاء" },
  "Génie civil": { en: "Civil engineering", ar: "الهندسة المدنية" },
  "Génie des procédés": { en: "Process engineering", ar: "هندسة الطرائق" },
  "Génie mécanique": { en: "Mechanical engineering", ar: "الهندسة الميكانيكية" },
  "Sciences de l'eau et de l'environnement": {
    en: "Water and environmental sciences",
    ar: "علوم المياه والبيئة",
  },
  Électronique: { en: "Electronics", ar: "الإلكترونيك" },
  "Énergies renouvelables": { en: "Renewable energy", ar: "الطاقات المتجددة" },
  "Automatique et électrotechnique": {
    en: "Automation and electrical engineering",
    ar: "الأوتوماتيك والإلكتروتقني",
  },
  "Tronc commun sciences et technologie (LMD)": {
    en: "Common core, science and technology (LMD)",
    ar: "جذع مشترك علوم وتكنولوجيا (ل.م.د)",
  },
  "Tronc commun sciences et technologie (ingénieur)": {
    en: "Common core, science and technology (engineering)",
    ar: "جذع مشترك علوم وتكنولوجيا (مهندس)",
  },
  Médecine: { en: "Medicine", ar: "الطب" },
  Pharmacie: { en: "Pharmacy", ar: "الصيدلة" },
  "Médecine dentaire": { en: "Dental medicine", ar: "طب الأسنان" },
  "Phase préclinique": { en: "Preclinical phase", ar: "الطور ما قبل السريري" },
  "Phase clinique": { en: "Clinical phase", ar: "الطور السريري" },
  "Médecine, chirurgie et reproduction animale": {
    en: "Animal medicine, surgery and reproduction",
    ar: "الطب والجراحة والتكاثر الحيواني",
  },
  "Technologie du lait et dérivés": { en: "Dairy technology", ar: "تكنولوجيا الحليب ومشتقاته" },
  "Technologie des céréales et dérivés": {
    en: "Cereal technology",
    ar: "تكنولوجيا الحبوب ومشتقاته",
  },
  "Technologie de l'eau et des boissons": {
    en: "Water and beverages technology",
    ar: "تكنولوجيا الماء والمشروبات",
  },
  "Techniques de commercialisation en sciences alimentaires": {
    en: "Marketing in food sciences",
    ar: "تقنيات التسويق في العلوم الغذائية",
  },
  Architecture: { en: "Architecture", ar: "الهندسة المعمارية" },
  Urbanisme: { en: "Urban planning", ar: "التعمير" },
  Patrimoine: { en: "Heritage", ar: "التراث" },
  "Construction aéronautique": { en: "Aircraft construction", ar: "بناء الطيران" },
  "Navigation aérienne": { en: "Air navigation", ar: "الملاحة الجوية" },
  "Études spatiales": { en: "Space studies", ar: "الدراسات الفضائية" },
};

export function localizeName(name: string, locale: Locale) {
  if (locale === "fr") return name;
  return LABELS[name]?.[locale] ?? name;
}
