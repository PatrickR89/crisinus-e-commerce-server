const express = require("express");

const { v4: uuidv4 } = require("uuid");

const { dbPoolPromise } = require("../mySqlConnection");
const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");

const router = express.Router();

router
    .route("/")
    .get(
        catchRequestError(async (req, res) => {
            try {
                const [result] = await dbPoolPromise.execute(
                    "SELECT * FROM giftshop"
                );
                res.send(result);
            } catch (err) {
                winston.error(err);
            }
        })
    )
    .post(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const name = req.body.name;
            const price = req.body.price;
            const max_order = req.body.max_order;
            const images = req.body.images;
            const description = req.body.description;

            try {
                const [addedItem] = await dbPoolPromise.execute(
                    "INSERT INTO giftshop (id, name, price, max_order, images, description) VALUES (?, ?, ?, ?, ?, ?)",
                    [uuidv4(), name, price, max_order, images, description]
                );
                res.send(addedItem);
            } catch (err) {
                winston.error(err);
            }
        })
    );

router
    .route("/:id")
    .post(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;

            const [item] = await dbPoolPromise.execute(
                "SELECT * FROM giftshop WHERE id = ?",
                [id]
            );
            res.send(item);
        })
    )
    .put(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;
            const name = req.body.name;
            const price = req.body.price;
            const max_order = req.body.max_order;
            const images = req.body.images;
            const description = req.body.description;

            const tempImgs = JSON.stringify(images);
            const [editedItem] = await dbPoolPromise.execute(
                "UPDATE giftshop SET name = ?, price =?, max_order =?, images =?, description =? WHERE id =?",
                [name, price, max_order, tempImgs, description, id]
            );

            res.send(editedItem);
        })
    )
    .delete(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;

            const [delItem] = await dbPoolPromise.execute(
                "DELETE FROM giftshop WHERE id = ?",
                [id]
            );

            res.send(delItem);
        })
    );

module.exports = router;
