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

module.exports = { verifyJWT };
