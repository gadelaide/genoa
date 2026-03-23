// routes pour les membres

const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');
const router = express.Router();

// TODO: ajouter middleware auth
//const { authenticateToken } = require('../middlewares/auth');

// POST /api/members : ajouter un membre
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const member = req.body;

        if (!member.nom || !member.prenom) {
            return res.status(400).json({ error: 'nom et prenom obligatoires' });
        }

        const result = await db.collection('members').insertOne({
            ...member,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({
            message: 'Membre créé',
            memberId: result.insertedId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/members : lister les membres
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const members = await db.collection('members').find({}).toArray();
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/members/:id
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        const member = await db.collection('members').findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!member) {
            return res.status(404).json({ error: 'Membre introuvable' });
        }

        res.json(member);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/members/:id pour modifier un membre
router.put('/:id', async (req, res) => {
    try {
        const db = getDb();
        const updates = req.body;

        const result = await db.collection('members').updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    ...updates,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Membre introuvable' });
        }

        res.json({ message: 'Membre modifié' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/members/:id pour supprimer un membre
router.delete('/:id', async (req, res) => {
    try {
        const db = getDb();

        const result = await db.collection('members').deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Membre introuvable' });
        }

        res.json({ message: 'Membre supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Ajouter les routes pour la "Gestion des relations familiales" 
// POST /api/members/couples
router.post('/couples', async (req, res) => {
    try {
        const db = getDb();
        const { membre1_id, membre2_id, dateUnion, dateSeparation } = req.body;

        if (!membre1_id || !membre2_id) {
            return res.status(400).json({ error: 'Les deux membres sont obligatoires' });
        }

        if (membre1_id === membre2_id) {
            return res.status(400).json({ error: 'Un membre ne peut pas être en couple avec lui-même' });
        }

        const result = await db.collection('couples').insertOne({
            membre1_id: new ObjectId(membre1_id),
            membre2_id: new ObjectId(membre2_id),
            dateUnion: dateUnion || null,
            dateSeparation: dateSeparation || null,
            createdAt: new Date()
        });

        res.status(201).json({
            message: 'Couple créé',
            coupleId: result.insertedId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/enfants', async (req, res) => {
    try {
        const db = getDb();
        const { couple_id, enfant_id, nature } = req.body;

        if (!couple_id || !enfant_id) {
            return res.status(400).json({ error: 'couple_id et enfant_id sont obligatoires' });
        }

        const result = await db.collection('enfants').insertOne({
            couple_id: new ObjectId(couple_id),
            enfant_id: new ObjectId(enfant_id),
            nature: nature || 'biologique',
            createdAt: new Date()
        });

        res.status(201).json({
            message: 'Lien enfant créé',
            relationId: result.insertedId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;