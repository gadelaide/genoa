# genoa
Projet Genoa : Application de gestion d’arbre généalogique intelligent 


Répartition des fonctionnalités:

1. Inscription et authentification : Gabriel
2. Gestion des utilisateurs : Gabriel
3. Gestion des membres : Eya + Gabriel 
4. Gestion des relations : Eya + Gabriel
5. Visualisation de l'arbre :Eya 
6. Recherche et navigation : Eya
7. Statistiques familiales : Eya
8. Gestion des droits et confidentialité : Gabriel


## Lancement du projet

### Backend
```bash
cd api
npm install
node server.js
```

### Frontend
```bash
cd ui/genoa
npm install
npx expo start
```

Variables d’environnement: 
Créer un fichier .env dans api/ avec :

-PORT
-MONGO_URL
-JWT_SECRET
