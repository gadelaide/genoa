// routes pour l'authentification

const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbObject = require('../config/db');

const { createUser } = require('../services/userService');

// utilitaire pour récupérer la collection users
function getUsersCollection() {
    const db = dbObject.getDb();
    if (!db) {
        throw new Error("Base de données non initialisée. Appelez connectToServer d'abord.");
    }
    return db.collection('users');
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        // verifier si premier utilisateur
        const users = await getUsersCollection();
        const isFirstUser = (await users.countDocuments() === 0);

        const newUser = await createUser({
            email: req.body.email,
            password: req.body.password,
            role: 'admin',  //isFirstUser ? 'admin' : 'lecteur',
            autoVerify: true //isFirstUser
        });

        res.status(201).json({
            message: 'Utilisateur créé',
            email: newUser.email,
            role: newUser.role
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const users = await getUsersCollection();

    // vérifier si l'utilisateur existe
    const user = await users.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Utilisateur introuvable! Inscrivez-vous d'abord." });
    }

    // vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // vérifier si le compte est validé
    if (!user.isVerified) {
        return res.status(400).json({ message: "Compte non validé encore par l'admin" });
    }

    // générer un JWT
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );

    res.json({ token, role: user.role });
});

module.exports = router;