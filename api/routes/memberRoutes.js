// routes pour les membres

const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');
const router = express.Router();

const { authenticateToken, requireEditor } = require('../middlewares/auth');



//CREATE / UPDATE / DELETE → éditeur
//READ → connecté seulement


// POST /api/members : ajouter un membre
router.post('/', authenticateToken, requireEditor, async (req, res) => {
    try {
        const db = getDb();
        const member = req.body;

        if (!member.nom || !member.prenom) {
            return res.status(400).json({ error: 'nom et prenom obligatoires' });
        }

        const result = await db.collection('members').insertOne({
            ...member,
            createdAt: new Date(),
            updatedAt: new Date(),
            createurId: new ObjectId(req.user.id),
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
router.get('/', authenticateToken, async (req, res) => {
    try {
        const db = getDb();
        const members = await db.collection('members').find({}).toArray();
        const filteredMembers = members.map(member => {
            const isCreator = member.createurId && member.createurId.toString() === req.user.id;
            const isAdmin = req.user.role === "admin";

            if (!isCreator && !isAdmin) {
                if (member.informationsComplementaires) {
                    delete member.informationsComplementaires.privee;
                }
            }
            return member;
        });

        res.json(filteredMembers);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/members/:id
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const db = getDb();
        const member = await db.collection('members').findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!member) {
            return res.status(404).json({ error: 'Membre introuvable' });
        }
        const isCreator = member.createurId && member.createurId.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isCreator && !isAdmin) {
            // cacher données privées
            if (member.informationsComplementaires) {
                delete member.informationsComplementaires.privee;
            }
        }

        res.json(member);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/members/:id pour modifier un membre
router.put('/:id',authenticateToken, requireEditor,  async (req, res) => {
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
router.delete('/:id',authenticateToken, requireEditor,  async (req, res) => {
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
router.post('/couples',authenticateToken, requireEditor,  async (req, res) => {
    try {
        const db = getDb();
        const { membre1_id, membre2_id, dateUnion, dateSeparation } = req.body;

        if (!membre1_id || !membre2_id) {
            return res.status(400).json({ error: 'Les deux membres sont obligatoires' });
        }

        if (membre1_id === membre2_id) {
            return res.status(400).json({ error: 'Un membre ne peut pas être en couple avec lui-même :) ' });
        }
        //verifier l'existence des membres
        const membre1 = await db.collection('members').findOne({
            _id: new ObjectId(membre1_id)
        });

        const membre2 = await db.collection('members').findOne({
            _id: new ObjectId(membre2_id)
        });

        if (!membre1 || !membre2) {
            return res.status(404).json({ error: 'Un ou plusieurs membres sont introuvables' });
        }

        //éviter les doublons des couples
        const existingCouple = await db.collection('couples').findOne({
            $or: [
                {
                    membre1_id: new ObjectId(membre1_id),
                    membre2_id: new ObjectId(membre2_id)
                },
                {
                    membre1_id: new ObjectId(membre2_id),
                    membre2_id: new ObjectId(membre1_id)
                }
            ]
        });

        if (existingCouple) {
            return res.status(400).json({ error: 'Ce couple existe déjà' });
        }

        const result = await db.collection('couples').insertOne({
            membre1_id: new ObjectId(membre1_id),
            membre2_id: new ObjectId(membre2_id),
            dateUnion: dateUnion || null,
            dateSeparation: dateSeparation || null,
            createdAt: new Date(),
            createurId: new ObjectId(req.user.id)
        });

        res.status(201).json({
            message: 'Couple créé',
            coupleId: result.insertedId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/members/enfants
router.post('/enfants', authenticateToken, requireEditor, async (req, res) => {
    try {
        const db = getDb();
        const { couple_id, enfant_id, nature } = req.body;

        if (!couple_id || !enfant_id) {
            return res.status(400).json({ error: 'couple_id et enfant_id sont obligatoires' });
        }

        //vérifier l'existence du couple avant d'ajouter l'enfant
        const couple = await db.collection('couples').findOne({
            _id: new ObjectId(couple_id)
        });

        if (!couple) {
            return res.status(404).json({ error: 'Couple introuvable' });
        }

        
        //vérifier l'existence de l'enfant 
        const enfant = await db.collection('members').findOne({
            _id: new ObjectId(enfant_id)
        });

        if (!enfant) {
            return res.status(404).json({ error: 'Enfant introuvable' });
        }

        //éviter les doublons
        const existingLink = await db.collection('enfants').findOne({
            couple_id: new ObjectId(couple_id),
            enfant_id: new ObjectId(enfant_id)
        });

        if (existingLink) {
            return res.status(400).json({ error: 'Ce lien enfant existe déjà pour ce couple' });
        }

        const result = await db.collection('enfants').insertOne({
            couple_id: new ObjectId(couple_id),
            enfant_id: new ObjectId(enfant_id),
            nature: nature || 'biologique',
            createdAt: new Date(),           
            createurId: new ObjectId(req.user.id)

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