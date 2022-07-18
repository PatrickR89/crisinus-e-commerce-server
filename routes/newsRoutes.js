const express = require("express");

const { v4: uuidv4 } = require("uuid");

const { dbAuth } = require("../mySqlConnection");
const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");

const router = express.Router();

let dbP;

const connection = async () => {
    dbP = await dbAuth;
};

connection();

router
    .route("/")
    .get(
        catchRequestError(async (req, res) => {
            const [news] = await dbP.execute("SELECT * FROM news");
            res.send(news);
        })
    )
    .post(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const title = req.body.title;
            const images = req.body.images;
            const text = req.body.text;

            const date = Date.now();
            const today = new Date(date);

            const [addNews] = await dbP.execute(
                "INSERT INTO news (id, title, text, images, date) VALUES (?, ?, ?, ?, ?)",
                [uuidv4(), title, text, images, today]
            );

            res.send(addNews);
        })
    );

router
    .route("/:id")
    .post(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;
            const [newsById] = await dbP.execute(
                "SELECT * FROM news WHERE id = ?",
                [id]
            );
            res.send(newsById);
        })
    )
    .put(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;
            const title = req.body.title;
            const images = req.body.images;
            const text = req.body.text;

            const date = Date.now();
            const today = new Date(date);

            const [editedNews] = await dbP.execute(
                "UPDATE news SET title = ?, text = ?, images = ?, date = ? WHERE id = ?",
                [title, text, images, today, id]
            );

            res.send(editedNews);
        })
    )
    .delete(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;
            const [delItem] = await dbP.execute(
                "DELETE FROM news WHERE id = ?",
                [id]
            );

            res.send(delItem);
        })
    );

module.exports = router;
