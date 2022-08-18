const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const router = express.Router();

const { catchRequestError } = require("../utils/catchAsync");
const { dbPoolPromise, checkDB } = require("../mySqlConnection");
const { verifyJWT } = require("../JWT/jwtMiddleware");
const { logger } = require("../utils/winstonLogger");

router
    .route("/register")
    .get(verifyJWT, (req, res) => {
        const token = req.headers["x-access-token"];
        logger.info(token);
        res.send("Authenticated!");
    })
    .post(checkDB, (req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        bcrypt.hash(password, 10, async (err, hash) => {
            const [newUser] = await dbPoolPromise.execute(
                "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
                [uuidv4(), username, hash],
                (err, result) => {
                    if (err) return logger.error(err);
                }
            );
        });
    });

router
    .route("/login")
    .get((req, res) => {
        if (req.session.user) {
            res.json({ loggedIn: true, user: req.session.user });
        } else {
            res.json({ loggedIn: false });
        }
    })
    .post(
        checkDB,
        catchRequestError(async (req, res) => {
            const username = req.body.username;
            const password = req.body.password;

            const [user] = await dbPoolPromise.execute(
                "SELECT * FROM users WHERE username =?",
                [username],
                (err, result) => {
                    if (err) return console.log(err);
                }
            );
            if (user.length > 0) {
                bcrypt.compare(password, user[0].password, (err, response) => {
                    if (response) {
                        req.session.user = user;
                        const id = user[0].id;
                        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                            expiresIn: 1000 * 60 * 60 * 24
                        });

                        res.cookie("access-token", token, {
                            maxAge: 1000 * 60 * 60 * 24,
                            httpOnly: true
                        });
                        res.json({ auth: true, token: token, result: user });
                    } else {
                        res.json({
                            auth: false,
                            message: "No username/password match"
                        });
                    }
                });
                logger.info(`user ${username} logged in`);
            } else {
                res.json({
                    auth: false,
                    message: "No username/password match"
                });
                logger.info(`user ${username} failed to login`);
            }
        })
    );

router.get("/logout", (req, res) => {
    res.clearCookie("access-token");
    res.clearCookie("id");
    logger.info(`User ${req.session.user[0].username} logged out`);
    req.session.destroy();
    res.end();
});

module.exports = router;
