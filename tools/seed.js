const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

// chargement des variables d'environnement
dotenv.config({ path: path.join(__dirname, '../api/.env') });

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = "genoa";

async function seed() {
    const client = new MongoClient(MONGO_URL);

    try {
        await client.connect();
        console.log("Connected to MongoDB...");
        const db = client.db(DB_NAME);

        // nettoyage des collections
        console.log("Cleaning collections...");
        await db.collection('users').deleteMany({});
        await db.collection('members').deleteMany({});
        await db.collection('couples').deleteMany({});
        await db.collection('enfants').deleteMany({});

        // création des users
        console.log("Creating users...");
        const hashedPw = await bcrypt.hash("password123", 10);

        const adminId = new ObjectId("60f1a2b30000000000000001");
        const editorId = new ObjectId("60f1a2b30000000000000002");
        const readerId = new ObjectId("60f1a2b30000000000000003");

        await db.collection('users').insertMany([
            {
                _id: adminId,
                email: "admin@genoa.fr",
                password: hashedPw,
                role: "admin",
                isVerified: true
            },
            {
                _id: editorId,
                email: "editeur@genoa.fr",
                password: hashedPw,
                role: "editeur",
                isVerified: true
            },
            {
                _id: readerId,
                email: "lecteur@genoa.fr",
                password: hashedPw,
                role: "lecteur",
                isVerified: true
            },
            {
                email: "guest@genoa.fr",
                password: hashedPw,
                role: "lecteur",
                isVerified: false
            }
        ]);

        // création des membres
        console.log("Creating members...");

        const m = {
            robert: new ObjectId("70a1b2c30000000000000001"),
            paulette: new ObjectId("70a1b2c30000000000000002"),
            jean: new ObjectId("70a1b2c30000000000000003"),
            marie: new ObjectId("70a1b2c30000000000000004"),
            sophie: new ObjectId("70a1b2c30000000000000005"),
            pierre: new ObjectId("70a1b2c30000000000000006"),
            julie: new ObjectId("70a1b2c30000000000000007"),
            lucas: new ObjectId("70a1b2c30000000000000008"),
            lea: new ObjectId("70a1b2c30000000000000009")
        };

        const membersData = [
            {
                _id: m.robert,
                nom: "Dupont",
                prenom: "Robert",
                sexe: "M",
                dateNaissance: "1920-03-10",
                dateDeces: "1995-12-05",
                professions: ["Menuisier"],
                coordonnees: { adresses: ["Ancienne Maison, Paris"], telephone: "0102030405", emails: [] },
                informationsComplementaires: { publique: "Ancien combattant.", privee: "Avait un trésor caché." },
                createurId: adminId
            },
            {
                _id: m.paulette,
                nom: "Dupont",
                prenom: "Paulette",
                sexe: "F",
                dateNaissance: "1924-07-22",
                dateDeces: null,
                professions: ["Institutrice"],
                coordonnees: { adresses: ["Maison de retraite, Lyon"], telephone: "0405060708", emails: ["paulette.d@orange.fr"] },
                informationsComplementaires: { publique: "Adore les fleurs.", privee: "Troubles de mémoire récents." },
                createurId: adminId
            },
            {
                _id: m.jean,
                nom: "Dupont",
                prenom: "Jean",
                sexe: "M",
                dateNaissance: "1955-05-14",
                dateDeces: null,
                professions: ["Boulanger", "Maire"],
                coordonnees: { adresses: ["12 rue du Pain, Paris"], telephone: "0601020304", emails: ["jean.dupont@famille.fr"] },
                informationsComplementaires: { publique: "Passionné de pétanque.", privee: "Fâché avec son cousin Hubert." },
                createurId: adminId
            },
            {
                _id: m.marie,
                nom: "Dupont",
                prenom: "Marie",
                sexe: "F",
                dateNaissance: "1958-11-30",
                dateDeces: null,
                professions: ["Infirmière"],
                coordonnees: { adresses: ["12 rue du Pain, Paris"], telephone: "0611223344", emails: ["marie.dupont@famille.fr"] },
                informationsComplementaires: { publique: "Très active dans l'association locale.", privee: "" },
                createurId: editorId
            },
            {
                _id: m.sophie,
                nom: "Bernard",
                prenom: "Sophie",
                sexe: "F",
                dateNaissance: "1960-01-15",
                dateDeces: null,
                professions: ["Comptable"],
                coordonnees: { adresses: ["45 avenue des Fleurs, Nice"], telephone: "0677889900", emails: ["sophie.b@gmail.com"] },
                informationsComplementaires: { publique: "", privee: "Garde rancune de son divorce." },
                createurId: adminId
            },
            {
                _id: m.pierre,
                nom: "Dupont",
                prenom: "Pierre",
                sexe: "M",
                dateNaissance: "1985-06-20",
                dateDeces: null,
                professions: ["Ingénieur"],
                coordonnees: { adresses: ["8 bis rue de la Gare, Bordeaux"], telephone: "0788991122", emails: ["pierre.dupont@pro.fr"] },
                informationsComplementaires: { publique: "Grand voyageur.", privee: "" },
                createurId: editorId
            },
            {
                _id: m.julie,
                nom: "Dupont",
                prenom: "Julie",
                sexe: "F",
                dateNaissance: "1988-03-12",
                dateDeces: null,
                professions: ["Designer"],
                coordonnees: { adresses: ["Londres, UK"], telephone: "+44778899", emails: ["julie@design.com"] },
                informationsComplementaires: { publique: "Adoptée à 2 ans.", privee: "Recherche ses parents biologiques." },
                createurId: adminId
            },
            {
                _id: m.lucas,
                nom: "Bernard-Dupont",
                prenom: "Lucas",
                sexe: "M",
                dateNaissance: "1992-09-05",
                dateDeces: null,
                professions: ["Étudiant"],
                coordonnees: { adresses: ["Cité U, Nice"], telephone: "", emails: ["lucas.bd@univ.fr"] },
                informationsComplementaires: { publique: "Fils de Jean et Sophie.", privee: "" },
                createurId: adminId
            },
            {
                _id: m.lea,
                nom: "Dupont",
                prenom: "Léa",
                sexe: "F",
                dateNaissance: "2015-12-25",
                dateDeces: null,
                professions: [],
                coordonnees: { adresses: ["Bordeaux"], telephone: "", emails: [] },
                informationsComplementaires: { publique: "La petite dernière.", privee: "Cache ses bonbons sous son lit." },
                createurId: editorId
            }
        ];

        await db.collection('members').insertMany(membersData);

        // création des couples
        console.log("Creating couples...");

        const c = {
            rp: new ObjectId("80b1c2d30000000000000001"),
            jm: new ObjectId("80b1c2d30000000000000002"),
            js: new ObjectId("80b1c2d30000000000000003"),
            pp: new ObjectId("80b1c2d30000000000000004")
        };

        const couplesData = [
            {
                _id: c.rp,
                membre1_id: m.robert,
                membre2_id: m.paulette,
                dateUnion: "1945-05-01",
                dateSeparation: null,
                createurId: adminId
            },
            {
                _id: c.jm,
                membre1_id: m.jean,
                membre2_id: m.marie,
                dateUnion: "1983-09-10",
                dateSeparation: null,
                createurId: adminId
            },
            {
                _id: c.js,
                membre1_id: m.jean,
                membre2_id: m.sophie,
                dateUnion: "1990-06-15",
                dateSeparation: "1994-02-20",
                createurId: adminId
            }
        ];

        await db.collection('couples').insertMany(couplesData);

        // création des liens enfants
        console.log("Creating children links...");

        const enfantsData = [
            {
                couple_id: c.rp,
                enfant_id: m.jean,
                nature: "biologique",
                createurId: adminId
            },
            {
                couple_id: c.jm,
                enfant_id: m.pierre,
                nature: "biologique",
                createurId: adminId
            },
            {
                couple_id: c.jm,
                enfant_id: m.julie,
                nature: "adopté",
                createurId: adminId
            },
            {
                couple_id: c.js,
                enfant_id: m.lucas,
                nature: "biologique",
                createurId: adminId
            }
        ];

        // ajout d'un partenaire pour Pierre pour Léa
        const partenairePierreId = new ObjectId();
        await db.collection('members').insertOne({
            _id: partenairePierreId,
            nom: "Mercier",
            prenom: "Emilie",
            sexe: "F",
            dateNaissance: "1987-04-05",
            createurId: editorId
        });

        const couplePierre = new ObjectId();
        await db.collection('couples').insertOne({
            _id: couplePierre,
            membre1_id: m.pierre,
            membre2_id: partenairePierreId,
            dateUnion: "2010-01-01",
            createurId: editorId
        });

        enfantsData.push({
            couple_id: couplePierre,
            enfant_id: m.lea,
            nature: "biologique",
            createurId: editorId
        });

        await db.collection('enfants').insertMany(enfantsData);

        console.log("Seeding completed successfully!");

    } catch (err) {
        console.error("Error during seeding:", err);
    } finally {
        await client.close();
    }
}

seed();
