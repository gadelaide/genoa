// routes pour l'authentification

const express = require('express');
const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
    // TODO: Récupérer email/mdp
    // TODO: Vérifier si l'email existe déjà
    // TODO: Hasher le mot de passe avec bcrypt
    // TODO: Sauvegarder dans la collection Users (statut non-validé)
    // TODO: Si 1er inscrit -> le passer Admin automatiquement
    res.status(200).json({ message: "Route d'inscription : WORK IN PROGRESS" });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    // TODO: Vérifier les identifiants en base de données
    // TODO: Vérifier si le compte est validé par un admin
    // TODO: Générer un JWT valide 24h
    res.status(200).json({ message: "Route de connexion : WORK IN PROGRESS" });
});

module.exports = router;
