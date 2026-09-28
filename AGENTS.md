# Personal Place — Règles de travail

## Déploiement (important)

- Ne **jamais** pousser directement sur `main` : `main` déploie automatiquement en production (Vercel pour le front, Render pour le backend `server/`).
- Travailler sur la branche `dev` :
  - `git checkout dev`
  - pousser sur `dev` (Vercel crée un déploiement de preview automatiquement)
- Merger `dev` → `main` **uniquement après validation de l'utilisateur** :
  - front : `git checkout main; git merge dev; git push`
  - back : mêmes étapes dans `server/`
- Après chaque merge, vérifier le déploiement : Render `/api/health`, chunk JS Vercel à jour.

## Commandes

- Front : `npm run lint` (oxlint — 0 erreur attendu), `npm run build`
- Back : `cd server && npm test` (`node --test`), `npm run lint`
- Backend local : `node index.js` dans `server/` (port 3001, auto-migration des tables au boot)
- Dev server front : `npm run dev` (port 5173)

## Base de données

- Neon PostgreSQL partagée entre le local et Render (la migration tourne au boot du serveur).
- Comptes de test : `design-577906391@test.local` / `PasserPro2026`.
