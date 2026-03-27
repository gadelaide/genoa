// route pour les utilisateurs

const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { createUser, updateUser, deleteUser } = require('../services/userService');

// GET /api/users : lister les utilisateurs
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const users = await db.collection('users').find({}).toArray();

        // cacher les mots de passe
        const filteredUsers = users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.json(filteredUsers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users/:id : obtenir un utilisateur par son ID
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const db = getDb();
        const user = await db.collection('users').findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur introuvable' });
        }

        // cacher le mot de passe
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/users : créer un compte pour un tiers
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const newUser = await createUser({
            email: req.body.email,
            password: req.body.password,
            role: 'lecteur',
            autoVerify: true
        });
        res.status(201).json({ message: 'Utilisateur créé', userId: newUser.userId });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/users/:id : valider une inscription ou partager les droits d'administration ou modifier un compte utilisateur

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const modifiedCount = await updateUser(req.params.id, req.body);
        res.json({
            message: 'Utilisateur mis à jour avec succès',
            modifiedCount
        });
    } catch (err) {
        res.status(err.message === 'Utilisateur introuvable' ? 404 : 400).json({ error: err.message });
    }
});

// DELETE /api/users/:id : supprimer un compte utilisateur
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const deletedCount = await deleteUser(req.params.id);
        res.json({ message: 'Utilisateur supprimé avec succès', deletedCount });
    } catch (err) {
        res.status(err.message === 'Utilisateur introuvable' ? 404 : 400).json({ error: err.message });
    }
});

module.exports = router;