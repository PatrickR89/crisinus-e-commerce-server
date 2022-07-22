const jwt = require("jsonwebtoken");
const { logger } = require("../utils/winstonLogger");

const verifyJWT = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (token === undefined) {
        token = req.body.headers["x-access-token"];
    }

    if (!token) {
        res.send("Token required");
        logger.warn("Failed attempt to access admin token");
    } else {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                logger.info(err);
                res.json({ auth: false, message: "Authentication failed" });
            } else {
                req.userId = decoded.id;
                next();
            }
        });
    }
};

const verifyClient = (req, res, next) => {
    let token = req.headers["client-access-token"];

    if (token === undefined && req.body.headers) {
        token = req.body.headers["client-access-token"];
    }

    if (!token) {
        logger.warn("Failed attempt to access API without client");
        res.send("API is for client use only!");
        return;
    } else {
        jwt.verify(token, process.env.JWT_CLIENT_SECRET, (err, decoded) => {
            if (err) {
                res.send("Access denied");
            } else {
                req.clientId = decoded.id;
                next();
            }
        });
    }
};

module.exports = { verifyJWT, verifyClient };
