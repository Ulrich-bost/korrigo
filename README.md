# UnivSujets

Plateforme web de **sujets d'examen corrigés**, classés par **département**, **filière** et **niveau** (L1, L2, L3, M1, M2). Après inscription, l'étudiant choisit son département et sa filière, puis consulte 3 sujets corrigés par niveau.

## Fonctionnalités

- Parcours : département → filière → niveau
- 3 sujets corrigés par filière et par niveau
- L'accès complet n'est proposé qu'après un clic sur « Voir plus »
- Paiement unique : **CCP** (EDAHABIA, Algérie) ou **carte** Visa/Mastercard d'une banque d'Afrique subsaharienne
- Espace admin pour ajouter des sujets par département

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS**
- **Prisma** + PostgreSQL
- **Chargily Pay** pour le CCP (Algérie) et **CinetPay** pour les cartes d'Afrique subsaharienne
- Sessions JWT (cookies httpOnly)

## Démarrage rapide

```bash
cd ~/projets/Korrigo
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Comptes de démo

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@univ-sujets.fr | admin123 |
| Abonné | demo@univ-sujets.fr | demo1234 |

## Configuration Chargily

1. Créer un compte sur [Chargily Pay](https://pay.chargily.com)
2. Copier la clé secrète dans `.env` (`CHARGILY_SECRET_KEY`)
3. `CHARGILY_MODE=test` pour le bac à sable, `live` en production
4. Le webhook est envoyé à `POST /api/webhooks/chargily` (aussi déclaré à chaque paiement)

## Configuration CinetPay

1. Créer un compte sur [CinetPay](https://cinetpay.com) dans un pays d'Afrique subsaharienne (devise XAF ou XOF)
2. Copier `CINETPAY_API_KEY` et `CINETPAY_SITE_ID` dans `.env`
3. `CINETPAY_CURRENCY` doit être la devise du compte (`XAF` ou `XOF`)
4. Notification : `POST /api/webhooks/cinetpay`
5. Le bouton carte n'ouvre que l'univers carte bancaire, pas le CCP ni les cartes CIB algériennes

## Structure

```
src/
├── app/
│   ├── sujets/          # Catalogue + détail
│   ├── tarifs/          # Paiement unique
│   ├── compte/          # Espace utilisateur
│   ├── admin/           # Back-office
│   └── api/webhooks/    # Webhooks Chargily et CinetPay
├── components/
└── lib/                 # Auth, Prisma, Chargily, CinetPay
prisma/
├── schema.prisma
└── seed.ts
```

## Production

- PostgreSQL (`DATABASE_URL`)
- Générer un `AUTH_SECRET` fort
- `CHARGILY_MODE=live` avec la clé secrète live
- Clés CinetPay live et `CINETPAY_CURRENCY` alignée sur le compte
- Héberger sur Vercel

## Licence

MIT
