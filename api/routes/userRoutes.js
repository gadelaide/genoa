// route pour les utilisateurs

const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

// GET /api/users : lister les utilisateurs
router.get('/', authenticateToken, requireAdmin, (req, res) => {
    // TODO: Vérifier que l'utilisateur a le droit "Admin"
    // TODO: Récupérer tous les utilisateurs
    // TODO: Renvoyer les utilisateurs
    res.status(200).json({ message: "Route des utilisateurs : WORK IN PROGRESS" });

});

// POST /api/users : créer un compte pour un tiers
router.post('/', authenticateToken, requireAdmin, (req, res) => {
    // TODO: Récupérer les données de l'utilisateur
    // TODO: Valider les données reçues (email, mdp, rôle, etc.)
    // TODO: Hasher le mot de passe avec bcrypt
    // TODO: Sauvegarder dans la collection Users
    res.status(201).json({ message: "Ajout d'un utilisateur : WORK IN PROGRESS" });

});

// PUT /api/users/:id : valider une inscirption ou partager les droits d'administration ou modifier un compte utilisateur
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
    // TODO: Récupérer l'ID dans req.params.id
    // TODO: Récupérer les nouvelles données dans req.body (ex: { isVerified: true } ou { role: "admin" })
    // TODO: Mettre à jour l'utilisateur dans MongoDB avec $set
    res.status(200).json({ message: "Modification d'un utilisateur : WORK IN PROGRESS" });

});

// DELETE /api/users/:id : supprimer un compte utilisateur
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
    // TODO: Supprimer l'utilisateur de la collection
    res.status(200).json({ message: "Suppression d'un utilisateur : WORK IN PROGRESS" });

});

module.exports = router;