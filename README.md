# UnivSujets

Plateforme web regroupant les **sujets d'examen corrigés** de l'université, avec abonnement **mensuel** (9,99 €) ou **annuel** (79,99 €).

## Fonctionnalités

- Catalogue de sujets filtrable (université, filière, année)
- Contenu premium réservé aux abonnés
- Inscription / connexion par email
- Paiement par carte via **Stripe** (Checkout + portail client)
- Espace admin pour ajouter universités et sujets
- Données de démo pré-chargées

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS**
- **Prisma** + SQLite
- **Stripe** pour les abonnements
- Sessions JWT (cookies httpOnly)

## Démarrage rapide

```bash
cd ~/projets/univ-sujets
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

## Configuration Stripe

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Copier les clés API test dans `.env`
3. Créer deux produits récurrents :
   - **Mensuel** : 9,99 €/mois → copier l'ID `price_...` dans `STRIPE_PRICE_MONTHLY`
   - **Annuel** : 79,99 €/an → copier l'ID dans `STRIPE_PRICE_YEARLY`
4. Configurer le webhook : `POST /api/webhooks/stripe`
   - Événements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - En local : `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Structure

```
src/
├── app/
│   ├── sujets/          # Catalogue + détail
│   ├── tarifs/          # Plans d'abonnement
│   ├── compte/          # Espace utilisateur
│   ├── admin/           # Back-office
│   └── api/webhooks/    # Webhooks Stripe
├── components/
└── lib/                 # Auth, Prisma, Stripe
prisma/
├── schema.prisma
└── seed.ts
```

## Production

- Remplacer SQLite par PostgreSQL (`DATABASE_URL`)
- Générer un `AUTH_SECRET` fort
- Passer Stripe en mode live
- Héberger sur Vercel, Railway, ou VPS

## Licence

MIT
