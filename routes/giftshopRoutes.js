const express = require("express");

const { v4: uuidv4 } = require("uuid");

const { dbAuth } = require("../mySqlConnection");
const { verifyJWT } = require("../JWT/jwtMiddleware");
const { logger } = require("../utils/winstonLogger");

const router = express.Router();

let dbP;

const connection = async () => {
    dbP = await dbAuth;
};

connection();

router
    .route("/")
    .get(async (req, res) => {
        try {
            const [result] = await dbP.execute("SELECT * FROM giftshop");
            res.send(result);
        } catch (err) {
            winston.error(err);
        }
    })
    .post(verifyJWT, async (req, res) => {
        const name = req.body.name;
        const price = req.body.price;
        const max_order = req.body.max_order;
        const images = req.body.images;
        const description = req.body.description;

        try {
            const [addedItem] = await dbP.execute(
                "INSERT INTO giftshop (id, name, price, max_order, images, description) VALUES (?, ?, ?, ?, ?, ?)",
                [uuidv4(), name, price, max_order, images, description]
            );
            res.send(addedItem);
        } catch (err) {
            winston.error(err);
        }
    });

router
    .route("/:id")
    .post(verifyJWT, async (req, res) => {
        const id = req.body.id;

        try {
            const [item] = await dbP.execute(
                "SELECT * FROM giftshop WHERE id = ?",
                [id]
            );
            res.send(item);
        } catch (err) {
            winston.error(err);
        }
    })
    .put(verifyJWT, async (req, res) => {
        const id = req.body.id;
        const name = req.body.name;
        const price = req.body.price;
        const max_order = req.body.max_order;
        const images = req.body.images;
        const description = req.body.description;

        const tempImgs = JSON.stringify(images);
        try {
            const [editedItem] = await dbP.execute(
                "UPDATE giftshop SET name = ?, price =?, max_order =?, images =?, description =? WHERE id =?",
                [name, price, max_order, tempImgs, description, id]
            );

            res.send(editedItem);
        } catch (err) {
            winston.error(err);
        }
    })
    .delete(verifyJWT, async (req, res) => {
        const id = req.body.id;

        try {
            const [delItem] = await dbP.execute(
                "DELETE FROM giftshop WHERE id = ?",
                [id]
            );

            res.send(delItem);
        } catch (err) {
            winston.error(err);
        }
    });

module.exports = router;
