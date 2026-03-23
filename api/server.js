require('dotenv').config(); // charge le .env
const express = require('express');

const dbObject = require('./config/db');

// importations des routes
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// middlewares globaux
app.use(express.json());

// route racine pour vérifier que l'API tourne
app.get('/', (req, res) => {
    res.send("🌳 Bienvenue sur l'API Genoa !");
});

// lancement de mongo puis de l'api
dbObject.connectToServer()
    .then(() => {

        // branchement des routes
        app.use('/api/auth', authRoutes);
        app.use('/api/members', memberRoutes);

        // lancement du serveur
        app.listen(PORT, () => {
            console.log(`Serveur Genoa en écoute sur http://localhost:${PORT}`);
        });

    })
    .catch(err => {
        console.error("Erreur de connexion MongoDB :", err);
        process.exit(1);
    });