const jwt = require("jsonwebtoken");

//middleware pour vérifier si l’utilisateur est authentifié
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']; //Authorization: Bearer MON_TOKEN

    let token;
    if (authHeader) {
        const parts = authHeader.split(' ');
        token = parts[1]; //parts[0] = "Bearer"
    } 

    if (!token) {
        return res.status(401).json({ message: "Token manquant" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) { 
            return res.status(403).json({ message: "Token invalide ou expiré" });
        }
        req.user = user;
        next();
    });
}

function requireEditor(req, res, next) {
    // toujours après authenticateToken
    if (!req.user || (req.user.role !== "editeur" && req.user.role !== "admin")) {
        return res.status(403).json({ message: "Droits insuffisants" });
    }
    next();
}

function requireAdmin(req, res, next) {
    // toujours après authenticateToken
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Droits insuffisants" });
    }
    next();
}

module.exports = { authenticateToken, requireEditor, requireAdmin };