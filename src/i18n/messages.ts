import type { Locale } from "@/i18n/config";

export type Dict = {
  meta: { title: string; description: string };
  nav: {
    catalog: string;
    login: string;
    signup: string;
    account: string;
    admin: string;
    exams: string;
    language: string;
  };
  footer: {
    tagline: string;
    navigation: string;
    catalog: string;
    signup: string;
    legal: string;
    mentions: string;
    terms: string;
    privacy: string;
    rights: string;
  };
  home: {
    badge: string;
    title1: string;
    title2: string;
    lead: string;
    chooseFaculty: string;
    createAccount: string;
    howTitle: string;
    howLead: string;
    steps: { title: string; desc: string }[];
    whyTitle: string;
    whyLead: string;
    why: { title: string; desc: string }[];
    structures: (count: number) => string;
    university: string;
  };
  catalog: {
    chooseFaculty: string;
    chooseFiliere: string;
    chooseLevel: string;
    blida: string;
    selectFiliere: (faculty: string) => string;
    openLevels: string;
    levelSubjects: string;
    crumbs: string;
    filiereCount: (count: number) => string;
    corrected: string;
    createToSee: string;
    afterSignup: (filiere: string, level: string) => string;
    createAccount: string;
    login: string;
    session: (year: number) => string;
    emptyLevel: string;
    seeMore: string;
    unavailable: string;
    empty: string;
  };
  subject: {
    unavailable: string;
    back: string;
    createTitle: string;
    createLead: string;
    createAccount: string;
    login: string;
    heading: string;
    download: string;
    downloadSubject: string;
    downloadCorrection: string;
    noCorrection: string;
    added: (date: string, views: number) => string;
  };
  auth: {
    loginTitle: string;
    loginLead: string;
    confirmed: string;
    signupTitle: string;
    signupLead: string;
    email: string;
    password: string;
    name: string;
    minChars: string;
    submitLogin: string;
    submitSignup: string;
    noAccount: string;
    signup: string;
    hasAccount: string;
    login: string;
    loading: string;
  };
  errors: {
    name: string;
    email: string;
    password: string;
    password_required: string;
    password_mismatch: string;
    invalid: string;
    exists: string;
    bad_login: string;
    unavailable: string;
    denied: string;
    ccp_unconfigured: string;
    card_unconfigured: string;
    payment: string;
    confirm_email: string;
    program_required: string;
  };
  account: {
    title: string;
    paid: string;
    pending: string;
    access: string;
    mySubjects: string;
    fullAccess: string;
    until: (date: string) => string;
    noEnd: string;
    pickFaculty: string;
    chooseFaculty: string;
    logout: string;
    danger: {
      zone: string;
      lead: string;
      confirm: string;
      cancel: string;
    };
    path: string;
    program: string;
    objectives: string;
    saveProfile: string;
    nameSaved: string;
    passwordSaved: string;
    passwordConfirm: string;
    scheduleTitle: string;
    scheduleLead: string;
    examLabel: string;
    examDate: string;
    addDate: string;
    reminder: (date: string) => string;
  };
  space: {
    hello: (name: string) => string;
    lead: string;
    emptyTitle: string;
    emptyLead: string;
    emptyCourse: string;
    papers: (count: number) => string;
    changeLevel: string;
    levelHint: string;
    saveLevel: string;
    other: string;
  };
  pricing: {
    title: string;
    lead: (price: string) => string;
    canceled: string;
    already: string;
    account: string;
    oneTime: string;
    ccpNote: (dzd: string, fcfa: string) => string;
    faqTitle: string;
    faq: { q: string; a: string }[];
    features: string[];
    offerName: string;
  };
  paywall: {
    title: string;
    lead: (price: string) => string;
    note: (dzd: string, fcfa: string) => string;
  };
  pay: { ccp: string; card: string; pending: string };
  legal: { placeholder: string; mentions: string; terms: string; privacy: string };
  admin: {
    title: string;
    hello: (name: string) => string;
    scopeAll: string;
    scopeLimited: (department: string, level: string) => string;
    summary: (subjects: number, structures: number, users: number) => string;
    created: string;
    add: string;
    publishLead: string;
    subjectSection: string;
    subjectFile: string;
    subjectFileHint: string;
    subjectFileSave: string;
    subjectFileSaved: string;
    subjectFileAttached: string;
    titleField: string;
    description: string;
    content: string;
    contentPlaceholder: string;
    correction: string;
    correctionLead: string;
    correctionPresent: string;
    correctionMissing: string;
    correctionFile: string;
    correctionFileHint: string;
    correctionAttached: string;
    accessChoice: string;
    openCorrection: string;
    completeCorrection: string;
    correctionSaved: string;
    backDashboard: string;
    navOverview: string;
    navSubjects: string;
    navAccounts: string;
    navProfile: string;
    profileLead: string;
    profileSave: string;
    scopeProgramLabel: (department: string, program: string, level: string) => string;
    scopeKind: string;
    scopeWhole: string;
    scopeProgramLevel: string;
    accountsTitle: string;
    accountsManageLead: string;
    createAccount: string;
    accountRole: string;
    accountPassword: string;
    accountPasswordKeep: string;
    addScope: string;
    removeScope: string;
    saveAccount: string;
    deleteAccount: string;
    demoLocked: string;
    accountSaved: string;
    faculty: string;
    facultyPlaceholder: string;
    filiere: string;
    filierePlaceholder: string;
    level: string;
    year: string;
    semester: string;
    semesterPlaceholder: string;
    examType: string;
    examPlaceholder: string;
    premium: string;
    publish: string;
    latest: string;
    manage: string;
    emptySubjects: string;
    colTitle: string;
    colFaculty: string;
    colFiliere: string;
    colLevel: string;
    colFree: string;
    colCorrection: string;
    yes: string;
    no: string;
    free: string;
    paid: string;
    namesStayFrench: string;
    overview: string;
    trendTitle: string;
    trendLead: string;
    mixTitle: string;
    mixLead: string;
    papersUnit: string;
    shareOfCatalog: (count: number) => string;
    emptyTrend: string;
    subjects: string;
    freeSubjects: string;
    paidSubjects: string;
    students: string;
    withCorrection: (count: number) => string;
    accountsTotal: (count: number) => string;
    accounts: string;
    accountsLead: string;
    accountsLeadAll: string;
    activeAccess: string;
    paymentsOk: string;
    paymentsPending: string;
    paymentsFailed: string;
    collected: string;
    none: string;
    recentAccounts: string;
    recentPayments: string;
    paymentsLead: string;
    paymentsLeadAll: string;
    emptyAccounts: string;
    emptyPayments: string;
    colName: string;
    colEmail: string;
    colRole: string;
    colJoined: string;
    colAccess: string;
    colAmount: string;
    colStatus: string;
    colMethod: string;
    colDate: string;
    roleAdmin: string;
    roleSuper: string;
    roleUser: string;
    accessActive: string;
    accessNone: string;
    statusPending: string;
    statusSuccessful: string;
    statusFailed: string;
    methodCcp: string;
    methodCard: string;
  };
};

const fr: Dict = {
  meta: {
    title: "KORRIGO — Révise intelligemment. Réussis facilement.",
    description:
      "KORRIGO fusionne la rigueur académique avec l'intelligence artificielle pour faciliter la réussite étudiante. Sujets d'examen corrigés classés par faculté, filière et niveau.",
  },
  nav: {
    catalog: "Catalogue",
    login: "Connexion",
    signup: "S'inscrire",
    account: "Mon compte",
    admin: "Admin",
    exams: "Mes épreuves",
    language: "Langue",
  },
  footer: {
    tagline: "L'IA au service de ta réussite. Sujets d'examen corrigés classés par faculté, filière et niveau.",
    navigation: "Navigation",
    catalog: "Catalogue",
    signup: "Créer un compte",
    legal: "Légal",
    mentions: "Mentions légales",
    terms: "CGV",
    privacy: "Confidentialité",
    rights: "Tous droits réservés.",
  },
  home: {
    badge: "L'IA au service de ta réussite",
    title1: "Révise intelligemment.",
    title2: "Réussis facilement.",
    lead: "Créez un compte, sélectionnez votre faculté ou votre institut puis votre filière, et consultez les sujets corrigés de votre niveau.",
    chooseFaculty: "Choisir une faculté",
    createAccount: "Créer un compte",
    howTitle: "Comment ça marche ?",
    howLead: "Trois étapes pour accéder aux corrigés",
    steps: [
      { title: "Créez un compte", desc: "L'inscription est rapide, avec votre nom et votre email." },
      { title: "Faculté et filière", desc: "Choisissez d'abord votre faculté ou votre institut, puis votre filière." },
      { title: "Votre niveau", desc: "Ouvrez L1, L2 ou L3 pour voir les sujets corrigés." },
    ],
    whyTitle: "Pourquoi KORRIGO ?",
    whyLead: "Tout ce dont vous avez besoin pour réussir vos examens",
    why: [
      { title: "Classement clair", desc: "Faculté ou institut, puis filière, puis niveau (L1, L2, L3)." },
      { title: "Corrigés détaillés", desc: "Chaque sujet inclut la correction complète et commentée." },
      { title: "Téléchargement PDF", desc: "Emportez vos sujets partout, même hors connexion." },
      { title: "Contenu vérifié", desc: "Sujets validés par des enseignants et étudiants." },
      { title: "Mises à jour régulières", desc: "Nouveaux sujets ajoutés chaque semaine." },
    ],
    structures: (count) => `${count} facultés et instituts au catalogue.`,
    university: "Université de Blida 1",
  },
  catalog: {
    chooseFaculty: "Choisissez une faculté ou un institut",
    chooseFiliere: "Choisissez une filière",
    chooseLevel: "Choisissez un niveau",
    blida: "Université de Blida 1. Ensuite, vous choisirez votre filière.",
    selectFiliere: (faculty) => `${faculty} — sélectionnez votre filière.`,
    openLevels: "Ouvrez L1, L2 ou L3 pour consulter les sujets corrigés.",
    levelSubjects: "Sujets et corrigés de ce niveau.",
    crumbs: "Facultés et instituts",
    filiereCount: (count) => `${count} filière${count > 1 ? "s" : ""}`,
    corrected: "Sujets corrigés",
    createToSee: "Créez un compte pour voir les corrigés",
    afterSignup: (filiere, level) => `Une fois inscrit, les sujets de ${filiere} ${level} s'affichent ici.`,
    createAccount: "Créer un compte",
    login: "Se connecter",
    session: (year) => `Session ${year}`,
    emptyLevel: "Aucun sujet pour ce niveau.",
    seeMore: "Voir plus",
    unavailable: "Le catalogue est momentanément indisponible. Réessayez dans quelques minutes.",
    empty: "Aucun sujet pour le moment.",
  },
  subject: {
    unavailable: "Ce sujet est momentanément indisponible. Réessayez dans quelques minutes.",
    back: "Retour au catalogue",
    createTitle: "Créez un compte pour continuer",
    createLead: "Choisissez ensuite votre faculté et votre filière pour consulter les corrigés.",
    createAccount: "Créer un compte",
    login: "Se connecter",
    heading: "Sujet et corrigé",
    download: "Télécharger le PDF",
    downloadSubject: "Télécharger le sujet",
    downloadCorrection: "Télécharger le corrigé",
    noCorrection: "Pas encore de corrigé pour ce sujet.",
    added: (date, views) => `Ajouté le ${date} · ${views} vues`,
  },
  auth: {
    loginTitle: "Connexion",
    loginLead: "Retrouve tes épreuves, classées par matière.",
    confirmed: "Adresse confirmée. Tu peux te connecter.",
    signupTitle: "Créer un compte",
    signupLead: "Choisis ta faculté ou ton institut, ta filière et ton niveau.",
    email: "Email",
    password: "Mot de passe",
    name: "Nom complet",
    minChars: "Minimum 8 caractères",
    submitLogin: "Se connecter",
    submitSignup: "S'inscrire",
    noAccount: "Pas encore de compte ?",
    signup: "S'inscrire",
    hasAccount: "Déjà un compte ?",
    login: "Se connecter",
    loading: "Chargement...",
  },
  errors: {
    name: "Nom requis (min. 2 caractères)",
    email: "Email invalide",
    password: "Mot de passe : min. 8 caractères",
    password_required: "Mot de passe requis",
    password_mismatch: "Les mots de passe ne correspondent pas.",
    invalid: "Données invalides",
    exists: "Un compte existe déjà avec cet email",
    bad_login: "Email ou mot de passe incorrect",
    unavailable: "Le service est momentanément indisponible. Réessayez dans quelques minutes.",
    denied: "Accès refusé",
    ccp_unconfigured: "Le CCP n'est pas encore configuré.",
    card_unconfigured: "Le paiement par carte n'est pas encore configuré.",
    payment: "Impossible de lancer le paiement.",
    confirm_email: "Confirmez votre adresse e-mail pour activer le compte.",
    program_required: "Choisissez d'abord votre filière dans votre compte.",
  },
  account: {
    title: "Mon compte",
    paid: "Paiement confirmé. Votre accès complet est actif.",
    pending: "Paiement en cours de confirmation. Actualisez dans quelques secondes si besoin.",
    access: "Accès",
    mySubjects: "Mes sujets",
    fullAccess: "Abonnement actif sur votre filière",
    until: (date) => `Accès jusqu'au ${date}`,
    noEnd: "Accès à cette filière jusqu'à la fin de la période.",
    pickFaculty: "Choisissez votre filière et votre niveau. L'abonnement annuel ouvre ensuite toute cette filière.",
    chooseFaculty: "Choisir une faculté",
    logout: "Se déconnecter",
    danger: {
      zone: "Déconnexion",
      lead: "Vous fermerez votre session sur cet appareil.",
      confirm: "Confirmer",
      cancel: "Annuler",
    },
    path: "Parcours académique",
    program: "Filière",
    objectives: "Objectifs",
    saveProfile: "Enregistrer le profil",
    nameSaved: "Nom mis à jour.",
    passwordSaved: "Mot de passe mis à jour.",
    passwordConfirm: "Confirmer le mot de passe",
    scheduleTitle: "Calendrier d'examens",
    scheduleLead: "Les rappels J-14 et J-7 s'affichent ici. L'envoi automatique n'est pas encore branché.",
    examLabel: "Intitulé",
    examDate: "Date de l'examen",
    addDate: "Ajouter la date",
    reminder: (date) => `Rappel le ${date}`,
  },
  space: {
    hello: (name) => `Bonjour ${name}`,
    lead: "Tes épreuves de ce niveau, classées par matière.",
    emptyTitle: "Pas encore d'épreuve",
    emptyLead: "Dès qu'une épreuve de ta filière et de ton niveau est ajoutée, elle apparaît ici, rangée par matière.",
    emptyCourse: "Aucune épreuve pour cette matière.",
    papers: (count) => (count === 1 ? "1 épreuve" : `${count} épreuves`),
    changeLevel: "Niveau",
    levelHint: "Tu pourras passer au niveau supérieur quand tu seras admis.",
    saveLevel: "Enregistrer le niveau",
    other: "Autres épreuves",
  },
  pricing: {
    title: "Voir plus de sujets",
    lead: (price) =>
      `Un abonnement annuel de ${price} ouvre toute votre filière. Un achat à l'acte débloque un seul sujet. CCP pour l'Algérie, ou carte d'une banque d'Afrique subsaharienne.`,
    canceled: "Paiement annulé. Vous pouvez réessayer quand vous voulez.",
    already: "Votre abonnement de filière est actif. Consultez",
    account: "votre compte",
    oneTime: "Abonnement annuel à la filière",
    ccpNote: (dzd, fcfa) =>
      `CCP via EDAHABIA, Algérie Poste (${dzd}). Carte Visa ou Mastercard d'une banque d'Afrique subsaharienne (${fcfa}), hors Algérie.`,
    faqTitle: "Questions fréquentes",
    faq: [
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "CCP (EDAHABIA, Algérie Poste) pour l'Algérie, à 500 DA. Carte Visa ou Mastercard émise par une banque d'Afrique subsaharienne, en francs CFA. Les cartes des banques algériennes ne passent pas par ce bouton.",
      },
      {
        q: "Les sujets sont-ils mis à jour ?",
        a: "Nous ajoutons de nouveaux sujets corrigés chaque semaine, classés par faculté, filière et niveau.",
      },
      {
        q: "Puis-je télécharger les PDF ?",
        a: "Oui, après le paiement unique vous pouvez télécharger les sujets au format PDF pour réviser hors ligne.",
      },
    ],
    features: [
      "Accès illimité aux sujets corrigés",
      "Téléchargement PDF",
      "Nouveaux sujets chaque semaine",
      "Un seul paiement, sans renouvellement",
    ],
    offerName: "Accès complet",
  },
  paywall: {
    title: "Débloquer ce sujet",
    lead: (price) =>
      `Un achat de ${price} débloque définitivement ce sujet et son corrigé. L'abonnement annuel, depuis les tarifs, ouvre toute votre filière.`,
    note: (dzd, fcfa) =>
      `CCP (Algérie, ${dzd}) ou carte Visa/Mastercard d'une banque d'Afrique subsaharienne (${fcfa}).`,
  },
  pay: { ccp: "Payer par CCP", card: "Payer par carte bancaire", pending: "Redirection vers le paiement..." },
  legal: {
    placeholder:
      "Cette page est un placeholder. Remplacez ce contenu par vos mentions légales, conditions générales de vente ou politique de confidentialité conformes à votre activité et à la réglementation applicable.",
    mentions: "Mentions légales",
    terms: "Conditions générales de vente",
    privacy: "Politique de confidentialité",
  },
  admin: {
    title: "Administration",
    hello: (name) => `Bonjour ${name}`,
    scopeAll: "Tout l'établissement",
    scopeLimited: (department, level) => `${department} · ${level}`,
    summary: (subjects, structures, users) =>
      `${subjects} sujets · ${structures} facultés et instituts · ${users} utilisateurs`,
    created: "Sujet ajouté avec succès.",
    add: "Publier un sujet",
    publishLead: "Le sujet et son corrigé sont publiés dans votre périmètre.",
    subjectSection: "Sujet",
    subjectFile: "Fichier du sujet",
    subjectFileHint: "PDF ou image, obligatoire. Document de l'épreuve, distinct du corrigé.",
    subjectFileSave: "Enregistrer le fichier du sujet",
    subjectFileSaved: "Fichier du sujet enregistré.",
    subjectFileAttached: "Le fichier du sujet est en ligne.",
    titleField: "Titre",
    description: "Description",
    content: "Texte du corrigé",
    contentPlaceholder: "Rédigez le corrigé lié à ce sujet",
    correction: "Corrigé",
    correctionLead: "Ce texte est enregistré comme corrigé de ce sujet.",
    correctionPresent: "Présent",
    correctionMissing: "Absent",
    correctionFile: "Fichier du corrigé",
    correctionFileHint: "PDF ou image, facultatif. Distinct du fichier du sujet.",
    correctionAttached: "Un fichier de corrigé est déjà lié.",
    accessChoice: "Ce sujet est",
    openCorrection: "Voir",
    completeCorrection: "Compléter",
    correctionSaved: "Corrigé enregistré.",
    backDashboard: "Retour au tableau de bord",
    navOverview: "Vue d'ensemble",
    navSubjects: "Sujets et corrigés",
    navAccounts: "Comptes",
    navProfile: "Mon profil",
    profileLead: "Modifiez votre nom et votre mot de passe. Le rôle, l'e-mail et le périmètre ne se changent pas ici.",
    profileSave: "Enregistrer",
    scopeProgramLabel: (department, program, level) => `${department} · ${program} · ${level}`,
    scopeKind: "Type de périmètre",
    scopeWhole: "Tout le département ou l'institut",
    scopeProgramLevel: "Une filière et un niveau",
    accountsTitle: "Comptes",
    accountsManageLead: "Créez un étudiant, un admin ou un super admin. Seul le super admin assigne les périmètres.",
    createAccount: "Créer le compte",
    accountRole: "Rôle",
    accountPassword: "Mot de passe",
    accountPasswordKeep: "Laisser vide pour conserver le mot de passe.",
    addScope: "Ajouter un périmètre",
    removeScope: "Retirer",
    saveAccount: "Enregistrer le compte",
    deleteAccount: "Supprimer le compte",
    demoLocked: "Compte de démonstration, non modifiable.",
    accountSaved: "Compte enregistré.",
    faculty: "Faculté ou institut",
    facultyPlaceholder: "Faculté des sciences",
    filiere: "Filière",
    filierePlaceholder: "Mathématiques",
    level: "Niveau",
    year: "Année",
    semester: "Semestre",
    semesterPlaceholder: "S1, S2...",
    examType: "Type d'examen",
    examPlaceholder: "Partiel, Final...",
    premium: "Hors des 3 premiers sujets du niveau (après « Voir plus »)",
    publish: "Publier",
    latest: "Derniers sujets",
    manage: "Sujets et corrigés",
    emptySubjects: "Aucun sujet dans ce périmètre.",
    colTitle: "Titre",
    colFaculty: "Faculté",
    colFiliere: "Filière",
    colLevel: "Niveau",
    colFree: "Accès",
    colCorrection: "Corrigé",
    yes: "Oui",
    no: "Non",
    free: "Gratuit",
    paid: "Payant",
    namesStayFrench: "Les noms enregistrés restent ceux du catalogue en français.",
    overview: "Vue d'ensemble",
    trendTitle: "Activité",
    trendLead: "Sujets publiés, six derniers mois",
    mixTitle: "Accès",
    mixLead: "Gratuit et payant dans votre périmètre",
    papersUnit: "sujets",
    shareOfCatalog: (count) => `${count} % du catalogue`,
    emptyTrend: "Aucune publication sur cette période.",
    subjects: "Sujets",
    freeSubjects: "Sujets gratuits",
    paidSubjects: "Sujets payants",
    students: "Étudiants",
    withCorrection: (count) => (count === 1 ? "1 avec corrigé" : `${count} avec corrigé`),
    accountsTotal: (count) => (count === 1 ? "1 compte au total" : `${count} comptes au total`),
    accounts: "Comptes",
    accountsLead: "Étudiants rattachés à votre périmètre.",
    accountsLeadAll: "Tous les comptes de l'établissement.",
    activeAccess: "Accès actifs",
    paymentsOk: "Paiements réussis",
    paymentsPending: "Paiements en attente",
    paymentsFailed: "Paiements échoués",
    collected: "Encaissé",
    none: "—",
    recentAccounts: "Derniers comptes",
    recentPayments: "Derniers paiements",
    paymentsLead: "Paiements des étudiants de votre périmètre.",
    paymentsLeadAll: "Tous les paiements de l'établissement.",
    emptyAccounts: "Aucun compte pour le moment.",
    emptyPayments: "Aucun paiement pour le moment.",
    colName: "Nom",
    colEmail: "Email",
    colRole: "Rôle",
    colJoined: "Inscription",
    colAccess: "Accès",
    colAmount: "Montant",
    colStatus: "Statut",
    colMethod: "Moyen",
    colDate: "Date",
    roleAdmin: "Admin",
    roleSuper: "Super admin",
    roleUser: "Étudiant",
    accessActive: "Actif",
    accessNone: "Aucun",
    statusPending: "En attente",
    statusSuccessful: "Réussi",
    statusFailed: "Échoué",
    methodCcp: "CCP",
    methodCard: "Carte",
  },
};

const en: Dict = {
  meta: {
    title: "KORRIGO — Study smarter. Succeed more easily.",
    description:
      "KORRIGO combines academic rigour with artificial intelligence to help students succeed. Corrected exam papers organised by faculty, programme and year.",
  },
  nav: {
    catalog: "Catalogue",
    login: "Log in",
    signup: "Sign up",
    account: "My account",
    admin: "Admin",
    exams: "My papers",
    language: "Language",
  },
  footer: {
    tagline: "AI in the service of your success. Corrected exam papers organised by faculty, programme and year.",
    navigation: "Navigation",
    catalog: "Catalogue",
    signup: "Create an account",
    legal: "Legal",
    mentions: "Legal notice",
    terms: "Terms of sale",
    privacy: "Privacy",
    rights: "All rights reserved.",
  },
  home: {
    badge: "AI in the service of your success",
    title1: "Study smarter.",
    title2: "Succeed more easily.",
    lead: "Create an account, choose your faculty or institute and your programme, then open the corrected papers for your year.",
    chooseFaculty: "Choose a faculty",
    createAccount: "Create an account",
    howTitle: "How does it work?",
    howLead: "Three steps to the corrections",
    steps: [
      { title: "Create an account", desc: "Sign up quickly with your name and email." },
      { title: "Faculty and programme", desc: "Choose your faculty or institute, then your programme." },
      { title: "Your year", desc: "Open L1, L2 or L3 to see the corrected papers." },
    ],
    whyTitle: "Why KORRIGO?",
    whyLead: "Everything you need to pass your exams",
    why: [
      { title: "Clear organisation", desc: "Faculty or institute, then programme, then year (L1, L2, L3)." },
      { title: "Detailed corrections", desc: "Every paper includes a full, commented correction." },
      { title: "PDF download", desc: "Take your papers anywhere, even offline." },
      { title: "Checked content", desc: "Papers reviewed by teachers and students." },
      { title: "Regular updates", desc: "New papers added every week." },
    ],
    structures: (count) => `${count} faculties and institutes in the catalogue.`,
    university: "University of Blida 1",
  },
  catalog: {
    chooseFaculty: "Choose a faculty or an institute",
    chooseFiliere: "Choose a programme",
    chooseLevel: "Choose a year",
    blida: "University of Blida 1. Next, you will choose your programme.",
    selectFiliere: (faculty) => `${faculty} — select your programme.`,
    openLevels: "Open L1, L2 or L3 to read the corrected papers.",
    levelSubjects: "Papers and corrections for this year.",
    crumbs: "Faculties and institutes",
    filiereCount: (count) => `${count} programme${count > 1 ? "s" : ""}`,
    corrected: "Corrected papers",
    createToSee: "Create an account to see the corrections",
    afterSignup: (filiere, level) => `Once you sign up, ${filiere} ${level} papers appear here.`,
    createAccount: "Create an account",
    login: "Log in",
    session: (year) => `${year} session`,
    emptyLevel: "No papers for this year.",
    seeMore: "See more",
    unavailable: "The catalogue is temporarily unavailable. Try again in a few minutes.",
    empty: "No papers yet.",
  },
  subject: {
    unavailable: "This paper is temporarily unavailable. Try again in a few minutes.",
    back: "Back to the catalogue",
    createTitle: "Create an account to continue",
    createLead: "Then choose your faculty and programme to read the corrections.",
    createAccount: "Create an account",
    login: "Log in",
    heading: "Paper and correction",
    download: "Download PDF",
    downloadSubject: "Download the paper",
    downloadCorrection: "Download the correction",
    noCorrection: "No correction for this paper yet.",
    added: (date, views) => `Added on ${date} · ${views} views`,
  },
  auth: {
    loginTitle: "Log in",
    loginLead: "Find your papers, organised by subject.",
    confirmed: "Email confirmed. You can sign in.",
    signupTitle: "Create an account",
    signupLead: "Choose your faculty or institute, your programme and your year.",
    email: "Email",
    password: "Password",
    name: "Full name",
    minChars: "At least 8 characters",
    submitLogin: "Log in",
    submitSignup: "Sign up",
    noAccount: "No account yet?",
    signup: "Sign up",
    hasAccount: "Already have an account?",
    login: "Log in",
    loading: "Loading...",
  },
  errors: {
    name: "Name required (at least 2 characters)",
    email: "Invalid email",
    password: "Password: at least 8 characters",
    password_required: "Password required",
    password_mismatch: "The passwords do not match.",
    invalid: "Invalid data",
    exists: "An account already exists with this email",
    bad_login: "Incorrect email or password",
    unavailable: "The service is temporarily unavailable. Try again in a few minutes.",
    denied: "Access denied",
    ccp_unconfigured: "CCP payment is not configured yet.",
    card_unconfigured: "Card payment is not configured yet.",
    payment: "The payment could not be started.",
    confirm_email: "Confirm your email address to activate the account.",
    program_required: "Choose your programme in your account first.",
  },
  account: {
    title: "My account",
    paid: "Payment confirmed. Your full access is active.",
    pending: "Payment is being confirmed. Refresh in a few seconds if needed.",
    access: "Access",
    mySubjects: "My papers",
    fullAccess: "Active subscription for your programme",
    until: (date) => `Access until ${date}`,
    noEnd: "Access to this programme until the period ends.",
    pickFaculty: "Choose your programme and year. The yearly subscription then opens that whole programme.",
    chooseFaculty: "Choose a faculty",
    logout: "Log out",
    danger: {
      zone: "Sign out",
      lead: "This closes your session on this device.",
      confirm: "Confirm",
      cancel: "Cancel",
    },
    path: "Academic path",
    program: "Programme",
    objectives: "Goals",
    saveProfile: "Save profile",
    nameSaved: "Name updated.",
    passwordSaved: "Password updated.",
    passwordConfirm: "Confirm password",
    scheduleTitle: "Exam calendar",
    scheduleLead: "The J-14 and J-7 reminders appear here. Automatic sending is not connected yet.",
    examLabel: "Title",
    examDate: "Exam date",
    addDate: "Add date",
    reminder: (date) => `Reminder on ${date}`,
  },
  space: {
    hello: (name) => `Hello ${name}`,
    lead: "Your papers for this year, organised by subject.",
    emptyTitle: "No papers yet",
    emptyLead: "As soon as a paper for your programme and year is added, it appears here, grouped by subject.",
    emptyCourse: "No paper for this subject yet.",
    papers: (count) => (count === 1 ? "1 paper" : `${count} papers`),
    changeLevel: "Year",
    levelHint: "You can move up a year once you are admitted.",
    saveLevel: "Save year",
    other: "Other papers",
  },
  pricing: {
    title: "See more papers",
    lead: (price) =>
      `A yearly subscription of ${price} opens your whole programme. A single purchase unlocks one paper. CCP for Algeria, or a card from a sub-Saharan African bank.`,
    canceled: "Payment cancelled. You can try again whenever you want.",
    already: "Your programme subscription is active. Open",
    account: "your account",
    oneTime: "Yearly programme subscription",
    ccpNote: (dzd, fcfa) =>
      `CCP via EDAHABIA, Algérie Poste (${dzd}). Visa or Mastercard from a sub-Saharan African bank (${fcfa}), outside Algeria.`,
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Which payment methods do you accept?",
        a: "CCP (EDAHABIA, Algérie Poste) for Algeria, at 500 DA. Visa or Mastercard issued by a sub-Saharan African bank, in CFA francs. Cards from Algerian banks do not use that button.",
      },
      {
        q: "Are the papers updated?",
        a: "We add new corrected papers every week, organised by faculty, programme and year.",
      },
      {
        q: "Can I download the PDFs?",
        a: "Yes. After the one-time payment you can download the papers as PDF and revise offline.",
      },
    ],
    features: [
      "Unlimited access to corrected papers",
      "PDF download",
      "New papers every week",
      "One payment, no renewal",
    ],
    offerName: "Full access",
  },
  paywall: {
    title: "Unlock this paper",
    lead: (price) =>
      `A purchase of ${price} unlocks this paper and its correction for good. The yearly subscription, from pricing, opens your whole programme.`,
    note: (dzd, fcfa) => `CCP (Algeria, ${dzd}) or a Visa/Mastercard from a sub-Saharan African bank (${fcfa}).`,
  },
  pay: { ccp: "Pay by CCP", card: "Pay by bank card", pending: "Redirecting to payment..." },
  legal: {
    placeholder:
      "This page is a placeholder. Replace it with a legal notice, terms of sale or privacy policy that matches your activity and the applicable rules.",
    mentions: "Legal notice",
    terms: "Terms of sale",
    privacy: "Privacy policy",
  },
  admin: {
    title: "Administration",
    hello: (name) => `Hello ${name}`,
    scopeAll: "The whole institution",
    scopeLimited: (department, level) => `${department} · ${level}`,
    summary: (subjects, structures, users) =>
      `${subjects} papers · ${structures} faculties and institutes · ${users} users`,
    created: "Paper added.",
    add: "Publish a paper",
    publishLead: "The paper and its correction are published in your scope.",
    subjectSection: "Paper",
    subjectFile: "Paper file",
    subjectFileHint: "Required PDF or image. The exam paper, separate from the correction.",
    subjectFileSave: "Save the paper file",
    subjectFileSaved: "Paper file saved.",
    subjectFileAttached: "The paper file is online.",
    titleField: "Title",
    description: "Description",
    content: "Correction text",
    contentPlaceholder: "Write the correction linked to this paper",
    correction: "Correction",
    correctionLead: "This text is saved as the correction for this paper.",
    correctionPresent: "Present",
    correctionMissing: "Missing",
    correctionFile: "Correction file",
    correctionFileHint: "Optional PDF or image. Separate from the paper file.",
    correctionAttached: "A correction file is already linked.",
    accessChoice: "This paper is",
    openCorrection: "View",
    completeCorrection: "Complete",
    correctionSaved: "Correction saved.",
    backDashboard: "Back to the dashboard",
    navOverview: "Overview",
    navSubjects: "Papers and corrections",
    navAccounts: "Accounts",
    navProfile: "My profile",
    profileLead: "Update your name and password. Role, email and scope are not changed here.",
    profileSave: "Save",
    scopeProgramLabel: (department, program, level) => `${department} · ${program} · ${level}`,
    scopeKind: "Scope type",
    scopeWhole: "A whole faculty or institute",
    scopeProgramLevel: "One programme and one year",
    accountsTitle: "Accounts",
    accountsManageLead: "Create a student, an admin or a super admin. Only a super admin assigns scopes.",
    createAccount: "Create account",
    accountRole: "Role",
    accountPassword: "Password",
    accountPasswordKeep: "Leave blank to keep the current password.",
    addScope: "Add a scope",
    removeScope: "Remove",
    saveAccount: "Save account",
    deleteAccount: "Delete account",
    demoLocked: "Demo account, locked.",
    accountSaved: "Account saved.",
    faculty: "Faculty or institute",
    facultyPlaceholder: "Faculté des sciences",
    filiere: "Programme",
    filierePlaceholder: "Mathématiques",
    level: "Year",
    year: "Year",
    semester: "Semester",
    semesterPlaceholder: "S1, S2...",
    examType: "Exam type",
    examPlaceholder: "Midterm, final...",
    premium: "Beyond the first 3 papers of the year (after “See more”)",
    publish: "Publish",
    latest: "Latest papers",
    manage: "Papers and corrections",
    emptySubjects: "No papers in this scope.",
    colTitle: "Title",
    colFaculty: "Faculty",
    colFiliere: "Programme",
    colLevel: "Year",
    colFree: "Access",
    colCorrection: "Correction",
    yes: "Yes",
    no: "No",
    free: "Free",
    paid: "Paid",
    namesStayFrench: "Saved names stay in French so they match the catalogue.",
    overview: "Overview",
    trendTitle: "Activity",
    trendLead: "Papers published, last six months",
    mixTitle: "Access",
    mixLead: "Free and paid in your scope",
    papersUnit: "papers",
    shareOfCatalog: (count) => `${count}% of the catalogue`,
    emptyTrend: "No publications in this period.",
    subjects: "Papers",
    freeSubjects: "Free papers",
    paidSubjects: "Paid papers",
    students: "Students",
    withCorrection: (count) => (count === 1 ? "1 with a correction" : `${count} with a correction`),
    accountsTotal: (count) => (count === 1 ? "1 account in total" : `${count} accounts in total`),
    accounts: "Accounts",
    accountsLead: "Students in your scope.",
    accountsLeadAll: "Every account in the institution.",
    activeAccess: "Active access",
    paymentsOk: "Successful payments",
    paymentsPending: "Pending payments",
    paymentsFailed: "Failed payments",
    collected: "Collected",
    none: "—",
    recentAccounts: "Latest accounts",
    recentPayments: "Latest payments",
    paymentsLead: "Payments from students in your scope.",
    paymentsLeadAll: "Every payment in the institution.",
    emptyAccounts: "No accounts yet.",
    emptyPayments: "No payments yet.",
    colName: "Name",
    colEmail: "Email",
    colRole: "Role",
    colJoined: "Signed up",
    colAccess: "Access",
    colAmount: "Amount",
    colStatus: "Status",
    colMethod: "Method",
    colDate: "Date",
    roleAdmin: "Admin",
    roleSuper: "Super admin",
    roleUser: "Student",
    accessActive: "Active",
    accessNone: "None",
    statusPending: "Pending",
    statusSuccessful: "Successful",
    statusFailed: "Failed",
    methodCcp: "CCP",
    methodCard: "Card",
  },
};

const ar: Dict = {
  meta: {
    title: "كوريغو — راجع بذكاء. انجح بسهولة.",
    description:
      "يجمع كوريغو الصرامة الأكاديمية والذكاء الاصطناعي لمساعدة الطلبة على النجاح. مواضيع امتحانات مصححة مرتبة حسب الكلية والشعبة والمستوى.",
  },
  nav: {
    catalog: "الفهرس",
    login: "دخول",
    signup: "تسجيل",
    account: "حسابي",
    admin: "إدارة",
    exams: "اختباراتي",
    language: "اللغة",
  },
  footer: {
    tagline: "الذكاء الاصطناعي في خدمة نجاحك. مواضيع امتحانات مصححة مرتبة حسب الكلية والشعبة والمستوى.",
    navigation: "التنقل",
    catalog: "الفهرس",
    signup: "إنشاء حساب",
    legal: "قانوني",
    mentions: "بيانات قانونية",
    terms: "شروط البيع",
    privacy: "الخصوصية",
    rights: "جميع الحقوق محفوظة.",
  },
  home: {
    badge: "الذكاء الاصطناعي في خدمة نجاحك",
    title1: "راجع بذكاء.",
    title2: "انجح بسهولة.",
    lead: "أنشئ حسابا، اختر كليتك أو معهدك ثم شعبتك، واطلع على المواضيع المصححة لمستواك.",
    chooseFaculty: "اختيار كلية",
    createAccount: "إنشاء حساب",
    howTitle: "كيف يعمل؟",
    howLead: "ثلاث خطوات للوصول إلى التصحيحات",
    steps: [
      { title: "أنشئ حسابا", desc: "التسجيل سريع، باسمك وبريدك الإلكتروني." },
      { title: "الكلية والشعبة", desc: "اختر أولا كليتك أو معهدك، ثم شعبتك." },
      { title: "مستواك", desc: "افتح السنة الأولى أو الثانية أو الثالثة للاطلاع على المواضيع المصححة." },
    ],
    whyTitle: "لماذا كوريغو؟",
    whyLead: "كل ما تحتاجه للنجاح في امتحاناتك",
    why: [
      { title: "ترتيب واضح", desc: "كلية أو معهد، ثم شعبة، ثم مستوى (ل1، ل2، ل3)." },
      { title: "تصحيحات مفصلة", desc: "كل موضوع يتضمن التصحيح الكامل مع الشرح." },
      { title: "تحميل PDF", desc: "خذ مواضيعك معك، حتى دون اتصال." },
      { title: "محتوى مراجع", desc: "مواضيع راجعها أساتذة وطلبة." },
      { title: "تحديث منتظم", desc: "مواضيع جديدة كل أسبوع." },
    ],
    structures: (count) => `${count} كليات ومعاهد في الفهرس.`,
    university: "جامعة البليدة 1",
  },
  catalog: {
    chooseFaculty: "اختر كلية أو معهدا",
    chooseFiliere: "اختر شعبة",
    chooseLevel: "اختر مستوى",
    blida: "جامعة البليدة 1. بعد ذلك تختار شعبتك.",
    selectFiliere: (faculty) => `${faculty} — اختر شعبتك.`,
    openLevels: "افتح السنة الأولى أو الثانية أو الثالثة للاطلاع على المواضيع المصححة.",
    levelSubjects: "مواضيع وتصحيحات هذا المستوى.",
    crumbs: "الكليات والمعاهد",
    filiereCount: (count) => (count === 1 ? "شعبة واحدة" : `${count} شعب`),
    corrected: "مواضيع مصححة",
    createToSee: "أنشئ حسابا لرؤية التصحيحات",
    afterSignup: (filiere, level) => `بعد التسجيل تظهر هنا مواضيع ${filiere} ${level}.`,
    createAccount: "إنشاء حساب",
    login: "دخول",
    session: (year) => `دورة ${year}`,
    emptyLevel: "لا يوجد موضوع لهذا المستوى.",
    seeMore: "عرض المزيد",
    unavailable: "الفهرس غير متاح مؤقتا. أعد المحاولة بعد بضع دقائق.",
    empty: "لا توجد مواضيع حاليا.",
  },
  subject: {
    unavailable: "هذا الموضوع غير متاح مؤقتا. أعد المحاولة بعد بضع دقائق.",
    back: "العودة إلى الفهرس",
    createTitle: "أنشئ حسابا للمتابعة",
    createLead: "ثم اختر كليتك وشعبتك للاطلاع على التصحيحات.",
    createAccount: "إنشاء حساب",
    login: "دخول",
    heading: "الموضوع والتصحيح",
    download: "تحميل PDF",
    downloadSubject: "تحميل الموضوع",
    downloadCorrection: "تحميل التصحيح",
    noCorrection: "لا يوجد تصحيح لهذا الموضوع بعد.",
    added: (date, views) => `أضيف في ${date} · ${views} مشاهدة`,
  },
  auth: {
    loginTitle: "دخول",
    loginLead: "اعثر على اختباراتك، مرتبة حسب المادة.",
    confirmed: "تم تأكيد البريد. يمكنك تسجيل الدخول.",
    signupTitle: "إنشاء حساب",
    signupLead: "اختر كليتك أو معهدك، وشعبتك ومستواك.",
    email: "البريد الإلكتروني",
    password: "كلمة السر",
    name: "الاسم الكامل",
    minChars: "8 أحرف على الأقل",
    submitLogin: "دخول",
    submitSignup: "تسجيل",
    noAccount: "ليس لديك حساب؟",
    signup: "تسجيل",
    hasAccount: "لديك حساب؟",
    login: "دخول",
    loading: "جار التحميل...",
  },
  errors: {
    name: "الاسم مطلوب (حرفان على الأقل)",
    email: "بريد إلكتروني غير صالح",
    password: "كلمة السر: 8 أحرف على الأقل",
    password_required: "كلمة السر مطلوبة",
    password_mismatch: "كلمتا السر غير متطابقتين.",
    invalid: "بيانات غير صالحة",
    exists: "يوجد حساب بهذا البريد الإلكتروني",
    bad_login: "البريد أو كلمة السر غير صحيحة",
    unavailable: "الخدمة غير متاحة مؤقتا. أعد المحاولة بعد بضع دقائق.",
    denied: "الدخول مرفوض",
    ccp_unconfigured: "الدفع عبر CCP غير مهيأ بعد.",
    card_unconfigured: "الدفع بالبطاقة غير مهيأ بعد.",
    payment: "تعذر بدء الدفع.",
    confirm_email: "أكّد بريدك الإلكتروني لتفعيل الحساب.",
    program_required: "اختر شعبتك أولا من حسابك.",
  },
  account: {
    title: "حسابي",
    paid: "تم تأكيد الدفع. وصولك الكامل مفعّل.",
    pending: "الدفع قيد التأكيد. حدّث الصفحة بعد بضع ثوان إذا لزم الأمر.",
    access: "الوصول",
    mySubjects: "مواضيعي",
    fullAccess: "اشتراك مفعّل على شعبتك",
    until: (date) => `الوصول حتى ${date}`,
    noEnd: "الوصول إلى هذه الشعبة حتى نهاية الفترة.",
    pickFaculty: "اختر شعبتك ومستواك. الاشتراك السنوي يفتح بعد ذلك كل هذه الشعبة.",
    chooseFaculty: "اختيار كلية",
    logout: "تسجيل الخروج",
    danger: {
      zone: "تسجيل الخروج",
      lead: "سيُغلق هذا جلستك على هذا الجهاز.",
      confirm: "تأكيد",
      cancel: "إلغاء",
    },
    path: "المسار الأكاديمي",
    program: "الشعبة",
    objectives: "الأهداف",
    saveProfile: "حفظ الملف",
    nameSaved: "تم تحديث الاسم.",
    passwordSaved: "تم تحديث كلمة السر.",
    passwordConfirm: "تأكيد كلمة السر",
    scheduleTitle: "رزنامة الامتحانات",
    scheduleLead: "تظهر تذكيرات 14 يوما و7 أيام هنا. الإرسال التلقائي غير موصول بعد.",
    examLabel: "العنوان",
    examDate: "تاريخ الامتحان",
    addDate: "إضافة التاريخ",
    reminder: (date) => `تذكير في ${date}`,
  },
  space: {
    hello: (name) => `مرحبا ${name}`,
    lead: "اختبارات هذا المستوى، مرتبة حسب المادة.",
    emptyTitle: "لا توجد اختبارات بعد",
    emptyLead: "بمجرد إضافة اختبار لشعبتك ومستواك، يظهر هنا مرتبا حسب المادة.",
    emptyCourse: "لا يوجد اختبار لهذه المادة.",
    papers: (count) => (count === 1 ? "اختبار واحد" : `${count} اختبارات`),
    changeLevel: "المستوى",
    levelHint: "يمكنك الانتقال إلى المستوى الأعلى بعد النجاح.",
    saveLevel: "حفظ المستوى",
    other: "اختبارات أخرى",
  },
  pricing: {
    title: "عرض المزيد من المواضيع",
    lead: (price) =>
      `اشتراك سنوي بقيمة ${price} يفتح كل شعبتك. شراء واحد يفتح موضوعا واحدا. CCP للجزائر، أو بطاقة بنك من إفريقيا جنوب الصحراء.`,
    canceled: "أُلغي الدفع. يمكنك المحاولة متى شئت.",
    already: "اشتراك شعبتك مفعّل. راجع",
    account: "حسابك",
    oneTime: "اشتراك سنوي في الشعبة",
    ccpNote: (dzd, fcfa) =>
      `CCP عبر الذهبية، بريد الجزائر (${dzd}). بطاقة فيزا أو ماستركارد من بنك في إفريقيا جنوب الصحراء (${fcfa})، خارج الجزائر.`,
    faqTitle: "أسئلة شائعة",
    faq: [
      {
        q: "ما وسائل الدفع المقبولة؟",
        a: "CCP (الذهبية، بريد الجزائر) للجزائر، بـ 500 دج. بطاقة فيزا أو ماستركارد صادرة عن بنك في إفريقيا جنوب الصحراء، بالفرنك الإفريقي. بطاقات البنوك الجزائرية لا تمر عبر هذا الزر.",
      },
      {
        q: "هل تُحدَّث المواضيع؟",
        a: "نضيف مواضيع مصححة جديدة كل أسبوع، مرتبة حسب الكلية والشعبة والمستوى.",
      },
      {
        q: "هل يمكن تحميل ملفات PDF؟",
        a: "نعم. بعد الدفع الواحد يمكنك تحميل المواضيع بصيغة PDF للمراجعة دون اتصال.",
      },
    ],
    features: ["وصول غير محدود إلى المواضيع المصححة", "تحميل PDF", "مواضيع جديدة كل أسبوع", "دفع واحد دون تجديد"],
    offerName: "وصول كامل",
  },
  paywall: {
    title: "فتح هذا الموضوع",
    lead: (price) => `شراء بقيمة ${price} يفتح هذا الموضوع وتصحيحه نهائيا. الاشتراك السنوي، من صفحة الأسعار، يفتح كل شعبتك.`,
    note: (dzd, fcfa) => `CCP (الجزائر، ${dzd}) أو بطاقة فيزا/ماستركارد من بنك في إفريقيا جنوب الصحراء (${fcfa}).`,
  },
  pay: { ccp: "الدفع عبر CCP", card: "الدفع بالبطاقة", pending: "جار التحويل إلى الدفع..." },
  legal: {
    placeholder: "هذه الصفحة مؤقتة. استبدل هذا النص بالبيانات القانونية أو شروط البيع أو سياسة الخصوصية المناسبة لنشاطك وللقواعد المعمول بها.",
    mentions: "بيانات قانونية",
    terms: "شروط البيع",
    privacy: "سياسة الخصوصية",
  },
  admin: {
    title: "الإدارة",
    hello: (name) => `مرحبا ${name}`,
    scopeAll: "كل المؤسسة",
    scopeLimited: (department, level) => `${department} · ${level}`,
    summary: (subjects, structures, users) => `${subjects} مواضيع · ${structures} كليات ومعاهد · ${users} مستخدمين`,
    created: "تمت إضافة الموضوع.",
    add: "نشر موضوع",
    publishLead: "يُنشر الموضوع وتصحيحه ضمن نطاقك.",
    subjectSection: "الموضوع",
    subjectFile: "ملف الموضوع",
    subjectFileHint: "PDF أو صورة، إلزامي. وثيقة الاختبار، منفصلة عن التصحيح.",
    subjectFileSave: "حفظ ملف الموضوع",
    subjectFileSaved: "تم حفظ ملف الموضوع.",
    subjectFileAttached: "ملف الموضوع متاح.",
    titleField: "العنوان",
    description: "الوصف",
    content: "نص التصحيح",
    contentPlaceholder: "اكتب التصحيح المرتبط بهذا الموضوع",
    correction: "التصحيح",
    correctionLead: "يُحفظ هذا النص كتصحيح لهذا الموضوع.",
    correctionPresent: "موجود",
    correctionMissing: "غير موجود",
    correctionFile: "ملف التصحيح",
    correctionFileHint: "PDF أو صورة، اختياري. منفصل عن ملف الموضوع.",
    correctionAttached: "يوجد ملف تصحيح مرتبط.",
    accessChoice: "هذا الموضوع",
    openCorrection: "عرض",
    completeCorrection: "إكمال",
    correctionSaved: "تم حفظ التصحيح.",
    backDashboard: "العودة إلى لوحة التحكم",
    navOverview: "نظرة عامة",
    navSubjects: "المواضيع والتصحيحات",
    navAccounts: "الحسابات",
    navProfile: "ملفي",
    profileLead: "عدّل اسمك وكلمة السر. الدور والبريد والنطاق لا يُغيَّران من هنا.",
    profileSave: "حفظ",
    scopeProgramLabel: (department, program, level) => `${department} · ${program} · ${level}`,
    scopeKind: "نوع النطاق",
    scopeWhole: "كل الكلية أو المعهد",
    scopeProgramLevel: "شعبة واحدة ومستوى واحد",
    accountsTitle: "الحسابات",
    accountsManageLead: "أنشئ طالبا أو مديرا أو مديرا عاما. المدير العام وحده يحدّد النطاقات.",
    createAccount: "إنشاء الحساب",
    accountRole: "الدور",
    accountPassword: "كلمة السر",
    accountPasswordKeep: "اتركه فارغا للإبقاء على كلمة السر.",
    addScope: "إضافة نطاق",
    removeScope: "سحب",
    saveAccount: "حفظ الحساب",
    deleteAccount: "حذف الحساب",
    demoLocked: "حساب تجريبي، غير قابل للتعديل.",
    accountSaved: "تم حفظ الحساب.",
    faculty: "الكلية أو المعهد",
    facultyPlaceholder: "Faculté des sciences",
    filiere: "الشعبة",
    filierePlaceholder: "Mathématiques",
    level: "المستوى",
    year: "السنة",
    semester: "السداسي",
    semesterPlaceholder: "S1, S2...",
    examType: "نوع الامتحان",
    examPlaceholder: "امتحان جزئي، نهائي...",
    premium: "خارج المواضيع الثلاثة الأولى للمستوى (بعد «عرض المزيد»)",
    publish: "نشر",
    latest: "آخر المواضيع",
    manage: "المواضيع والتصحيحات",
    emptySubjects: "لا توجد مواضيع في هذا النطاق.",
    colTitle: "العنوان",
    colFaculty: "الكلية",
    colFiliere: "الشعبة",
    colLevel: "المستوى",
    colFree: "الوصول",
    colCorrection: "التصحيح",
    yes: "نعم",
    no: "لا",
    free: "مجاني",
    paid: "مدفوع",
    namesStayFrench: "الأسماء المحفوظة تبقى بالفرنسية لتطابق الفهرس.",
    overview: "نظرة عامة",
    trendTitle: "النشاط",
    trendLead: "المواضيع المنشورة خلال ستة أشهر",
    mixTitle: "الوصول",
    mixLead: "المجاني والمدفوع في نطاقك",
    papersUnit: "مواضيع",
    shareOfCatalog: (count) => `${count}٪ من الفهرس`,
    emptyTrend: "لا منشورات في هذه الفترة.",
    subjects: "المواضيع",
    freeSubjects: "مواضيع مجانية",
    paidSubjects: "مواضيع مدفوعة",
    students: "الطلبة",
    withCorrection: (count) => (count === 1 ? "موضوع واحد مع تصحيح" : `${count} مع تصحيح`),
    accountsTotal: (count) => (count === 1 ? "حساب واحد في المجموع" : `${count} حسابات في المجموع`),
    accounts: "الحسابات",
    accountsLead: "طلبة نطاقك.",
    accountsLeadAll: "كل حسابات المؤسسة.",
    activeAccess: "وصول مفعّل",
    paymentsOk: "مدفوعات ناجحة",
    paymentsPending: "مدفوعات قيد الانتظار",
    paymentsFailed: "مدفوعات فاشلة",
    collected: "المحصّل",
    none: "—",
    recentAccounts: "آخر الحسابات",
    recentPayments: "آخر المدفوعات",
    paymentsLead: "مدفوعات طلبة نطاقك.",
    paymentsLeadAll: "كل مدفوعات المؤسسة.",
    emptyAccounts: "لا توجد حسابات حاليا.",
    emptyPayments: "لا توجد مدفوعات حاليا.",
    colName: "الاسم",
    colEmail: "البريد",
    colRole: "الدور",
    colJoined: "التسجيل",
    colAccess: "الوصول",
    colAmount: "المبلغ",
    colStatus: "الحالة",
    colMethod: "الوسيلة",
    colDate: "التاريخ",
    roleAdmin: "إدارة",
    roleSuper: "مدير عام",
    roleUser: "طالب",
    accessActive: "مفعّل",
    accessNone: "لا شيء",
    statusPending: "قيد الانتظار",
    statusSuccessful: "ناجح",
    statusFailed: "فاشل",
    methodCcp: "CCP",
    methodCard: "بطاقة",
  },
};

export const dictionaries: Record<Locale, Dict> = { fr, en, ar };
