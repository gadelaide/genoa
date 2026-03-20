// TODO: vérification par token
function authenticateToken(req, res, next) {
    console.log("Middleware : Vérification du token (à faire)");
    next();
}

// TODO: vérification éditeur
function requireEditor(req, res, next) {
    console.log("Middleware : Vérification des droits Editeur (à faire)");
    next();
}

// TODO: vérification admin
function requireAdmin(req, res, next) {
    console.log("Middleware : Vérification des droits Admin (à faire)");
    next();
}

module.exports = { authenticateToken, requireEditor, requireAdmin };