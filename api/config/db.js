const { MongoClient } = require('mongodb');

let dbConnection;

module.exports = {
    connectToServer: async function () {
        try {
            // url dans le .env
            const client = new MongoClient(process.env.MONGO_URL);
            await client.connect();

            // base de données "genoa"
            dbConnection = client.db("genoa");
            console.log("Connecté à MongoDB (Base: genoa)");
        } catch (err) {
            console.error("Erreur de connexion MongoDB :", err);
            process.exit(1);
        }
    },
    getDb: function () {
        return dbConnection;
    }
};