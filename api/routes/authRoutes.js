// routes pour l'authentification

const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbObject = require('../config/db');

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
    const { email, password } = req.body;

    const users = await getUsersCollection();

    // vérifier si email disponible
    const existingUser = await users.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Email déjà existant" });
    }

    // hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // vérifier si c'est le premier utilisateur
    const isFirstUser = (await users.countDocuments() === 0);

    // créer l'utilisateur
    const newUser = {
        email,
        password: hashedPassword,
        role: isFirstUser ? "admin" : "lecteur",
        isVerified: isFirstUser //le premier compte est le seul qui n'a pas besoin de validation
    };

    await users.insertOne(newUser);

    res.status(201).json({
        message: "Utilisateur créé",
        email: newUser.email,
        role: newUser.role
    });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const users = await getUsersCollection();

    // vérifier si l'utilisateur existe
    const user = await users.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Utilisateur introuvable" });
    }

    // vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // vérifier si le compte est validé
    if (!user.isVerified) {
        return res.status(400).json({ message: "Compte non validé" });
    }

    // générer un JWT
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );

    res.json({ token });
});

module.exports = router;