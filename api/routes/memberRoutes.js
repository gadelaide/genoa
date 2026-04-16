// routes pour les membres

const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../config/db');
const router = express.Router();

const { authenticateToken, requireEditor } = require('../middlewares/auth');



//CREATE / UPDATE / DELETE → éditeur
//READ → connecté seulement

 
// GET /api/members/search?q=texte (on le met avant get /api/members/:id pour ne pas confondre search... comme un id)
router.get('/search', authenticateToken, async (req, res) => {
    try {
        const db = getDb();
        const q = (req.query.q || '').trim();

        if (!q) {
            return res.json([]);
        }

        const regex = new RegExp(q, 'i');

        const members = await db.collection('members').find({
            $or: [
                { nom: regex },
                { prenom: regex }
            ]
        }).toArray();

        res.json(members);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
// GET /api/members/stats
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const db = getDb();

        const members = await db.collection('members').find({}).toArray();
        const couples = await db.collection('couples').find({}).toArray();
        const enfantsLinks = await db.collection('enfants').find({}).toArray();

        const totalMembers = members.length;

        const totalHommes = members.filter(m => m.sexe === 'M').length;
        const totalFemmes = members.filter(m => m.sexe === 'F').length;

        // espérance de vie moyenne : seulement membres avec naissance + décès
        const lifespans = members
            .filter(m => m.dateNaissance && m.dateDeces)
            .map(m => {
                const birth = new Date(m.dateNaissance);
                const death = new Date(m.dateDeces);
                const years = (death - birth) / (1000 * 60 * 60 * 24 * 365.25);
                return years;
            })
            .filter(v => !isNaN(v) && v >= 0);

        const moyenneEsperanceVie = lifespans.length
            ? Number((lifespans.reduce((a, b) => a + b, 0) / lifespans.length).toFixed(1))
            : 0;

        // moyenne d'enfants par couple
        const moyenneEnfantsParCouple = couples.length
            ? Number((enfantsLinks.length / couples.length).toFixed(1))
            : 0;

        // nombre de générations (approx simple par dates de naissance)
        const birthYears = members
            .filter(m => m.dateNaissance)
            .map(m => new Date(m.dateNaissance).getFullYear())
            .filter(y => !isNaN(y));

        let nombreGenerations = 0;
        if (birthYears.length > 0) {
            const minYear = Math.min(...birthYears);
            const maxYear = Math.max(...birthYears);
            nombreGenerations = Math.max(1, Math.ceil((maxYear - minYear + 1) / 25));
        }

        res.json({
            totalMembers,
            totalHommes,
            totalFemmes,
            moyenneEsperanceVie,
            moyenneEnfantsParCouple,
            nombreGenerations
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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

// GET /api/members/:id/relations : récupérer les relations d'un membre
router.get('/:id/relations', authenticateToken, async (req, res) => {
    try {
        const db = getDb();

        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'ID invalide' });
        }

        const memberId = new ObjectId(req.params.id);

        const member = await db.collection('members').findOne({ _id: memberId });
        if (!member) {
            return res.status(404).json({ error: 'Membre introuvable' });
        }

        // 1) Couples où le membre apparaît
        const couples = await db.collection('couples').find({
            $or: [
                { membre1_id: memberId },
                { membre2_id: memberId }
            ]
        }).toArray();

        // 2) Conjoints
        const conjointIds = couples.map(c =>
            c.membre1_id.equals(memberId) ? c.membre2_id : c.membre1_id
        );

        const conjoints = conjointIds.length
            ? await db.collection('members').find({
                _id: { $in: conjointIds }
            }).toArray()
            : [];

        // 3) Enfants de ce membre via ses couples
        const coupleIds = couples.map(c => c._id);

        const enfantLinks = coupleIds.length
            ? await db.collection('enfants').find({
                couple_id: { $in: coupleIds }
            }).toArray()
            : [];

        const enfantIds = enfantLinks.map(link => link.enfant_id);

        const enfants = enfantIds.length
            ? await db.collection('members').find({
                _id: { $in: enfantIds }
            }).toArray()
            : [];

        // 4) Parents du membre : on cherche les couples dont ce membre est l'enfant
        const parentLinks = await db.collection('enfants').find({
            enfant_id: memberId
        }).toArray();

        const parentCoupleIds = parentLinks.map(link => link.couple_id);

        const parentCouples = parentCoupleIds.length
            ? await db.collection('couples').find({
                _id: { $in: parentCoupleIds }
            }).toArray()
            : [];

        const parentIds = parentCouples.flatMap(c => [c.membre1_id, c.membre2_id]);

        const parents = parentIds.length
            ? await db.collection('members').find({
                _id: { $in: parentIds }
            }).toArray()
            : [];

        res.json({
            parents,
            conjoints,
            enfants,
            couples
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




module.exports = router;