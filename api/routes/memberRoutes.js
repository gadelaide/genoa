// routes pour les membres

const express = require('express');
const router = express.Router();
const { authenticateToken, requireEditor, requireAdmin } = require('../middlewares/auth');

// GET /api/members : lister les membres
router.get('/', authenticateToken, (req, res) => {
    // TODO: Récupérer l'arbre généalogique depuis MongoDB
    // TODO: Filtrer les données privées selon les droits du demandeur
    res.status(200).json({ message: "Liste des membres : WORK IN PROGRESS" });
});

// POST /api/members : ajouter un membre
router.post('/', authenticateToken, requireEditor, (req, res) => {
    // TODO: Vérifier que l'utilisateur a le droit "Éditeur" ou "Admin"
    // TODO: Valider les données reçues (Nom, prénom, etc.)
    // TODO: Insérer le membre dans MongoDB
    res.status(201).json({ message: "Ajout d'un membre : WORK IN PROGRESS" });
});

// TODO: Ajouter la route PUT /:id pour modifier un membre
// TODO: Ajouter la route DELETE /:id pour supprimer un membre
// TODO: Ajouter les routes pour la "Gestion des relations familiales" (Point 4 du PDF)

module.exports = router;
