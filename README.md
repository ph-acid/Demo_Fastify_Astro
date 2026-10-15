# Demo_Fastify_Astro

Demo Fastify + HTMX - Astronomie

## Messier — démo Fastify + HTMX

Une petite vitrine astronomique construite avec Fastify. Les données du catalogue restent dans `backend/messier.js` : le navigateur ne reçoit pas le tableau en JSON. HTMX demande au backend le fragment HTML du catalogue, servi par `GET /messier`.

Chaque objet ouvre sa fiche à l'URL `/messier/:id`. La navigation HTMX remplace le contenu principal et met l'URL à jour ; la même route sert aussi une page complète si elle est ouverte directement.

## Démarrer

```sh
npm install
npm start
```

Ouvrir [http://localhost:3000](http://localhost:3000). HTMX est chargé depuis un CDN ; les polices web le sont également.

## Tester

```sh
npm test
```

