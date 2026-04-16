// services/userService.js
const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

function emailFormat(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
}

function passwordFormat(password) {
    const passwordRegex = /^.{6,}$/;
    return passwordRegex.test(password);
}

function roleFormat(role) {
    return ['lecteur', 'editeur', 'admin'].includes(role);
}

async function createUser({ email, password, role = 'lecteur', autoVerify = false }) {
    if (!email || !password) {
        throw new Error('Email et mot de passe obligatoires');
    }

    // vérifier si email déjà utilisé
    const db = getDb();
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
        throw new Error('Email déjà existant! Veuillez vous connecter directement.');
    }

    // verifier format de l'email 
    if (!emailFormat(email)) {
        throw new Error('Format de mail invalide');
    }

    // verifier format mdp
    if (!passwordFormat(password)) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }

    // hasher mdp
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        email,
        password: hashedPassword,
        role,
        isVerified: autoVerify,
    };

    // ajout de l'utilisateur
    const result = await db.collection('users').insertOne(newUser);

    return { userId: result.insertedId, ...newUser };
}

async function updateUser(userId, updates) {
    const db = getDb();

    // sécurité pour ne pas modifier l'id
    delete updates._id;

    // vérifier format email
    if (updates.email) {
        if (!emailFormat(updates.email)) {
            throw new Error('Format de mail invalide');
        }
    }

    // vérifier format mdp
    if (updates.password) {
        if (!passwordFormat(updates.password)) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }
        updates.password = await bcrypt.hash(updates.password, 10);
    }

    // vérifier rôle est valide
    if (updates.role && !roleFormat(updates.role)) {
        throw new Error('Rôle invalide');
    }

    //vérifier format isverified 
    if (updates.isVerified !== undefined && typeof updates.isVerified !== "boolean") {
        throw new Error("isVerified doit être un booléen");
    }
    
    const result = await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: updates }
    );

    if (result.matchedCount === 0) {
        throw new Error('Utilisateur introuvable');
    }

    return result.modifiedCount;
}

async function deleteUser(userId) {
    const db = getDb();

    // On pourrait ajouter des règles : par exemple empêcher de supprimer le dernier admin
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) throw new Error('Utilisateur introuvable');

    // Supprimer l'utilisateur
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

    return result.deletedCount;
}

module.exports = {
    createUser,
    updateUser,
    deleteUser
};
