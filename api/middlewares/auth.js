const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    let token;
    if (authHeader) {
        const parts = authHeader.split(' ');
        token = parts[1];
    } else {
        token = undefined;
    }

    if (!token) {
        res.status(401);
        res.json({ message: "Token manquant" });
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            res.status(403)
            res.json({ message: "Token invalide ou expiré" });
            return;
        }
        req.user = user;
        next();
    });
}

function requireEditor(req, res, next) {
    // toujours après authenticateToken
    if (!req.user || (req.user.role !== "editor" && req.user.role !== "admin")) {
        res.status(403);
        res.json({ message: "Droits insuffisants" });
        return;
    }
    next();
}

function requireAdmin(req, res, next) {
    // toujours après authenticateToken
    if (!req.user || req.user.role !== "admin") {
        res.status(403);
        res.json({ message: "Droits insuffisants" });
        return;
    }
    next();
}

module.exports = { authenticateToken, requireEditor, requireAdmin };