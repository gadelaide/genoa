require('dotenv').config(); // charge le .env
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');


const dbObject = require('./config/db');

// importations des routes
const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});
app.set('io', io);

const PORT = process.env.PORT || 3000;

// middlewares globaux
app.use(cors());
app.use(express.json());

// route racine pour vérifier que l'API tourne
app.get('/', (req, res) => {
    res.send("🌳 Bienvenue sur l'API Genoa ! \n");
});

// lancement de mongo puis de l'api
dbObject.connectToServer()
    .then(() => {

        // branchement des routes
        app.use('/api/auth', authRoutes);
        app.use('/api/members', memberRoutes);
        app.use('/api/users', userRoutes);

        // lancement du serveur
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Serveur Genoa en écoute sur http://localhost:${PORT}`);
            console.log(`Socket.IO est activé et en écoute.`);
        });

    })
    .catch(err => {
        console.error("Erreur de connexion MongoDB :", err);
        process.exit(1);
    });





