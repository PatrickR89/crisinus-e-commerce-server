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
            const [result] = await dbP.execute("SELECT * FROM books");
            res.send(result);
        })
    )
    .post(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const title = req.body.title;
            const genre = req.body.genre;
            const max_order = req.body.maxOrder;
            const price = req.body.price;
            const publisher = req.body.publisher;
            const language = req.body.language;
            const year = req.body.year;
            const desc = req.body.desc;
            const imgs = req.body.images;
            const authors = req.body.authors;

            let tempImgs = JSON.stringify(imgs);

            const authorsIds = await Promise.all(
                authors.map((author) => {
                    return new Promise(async (resolve, reject) => {
                        let [result] = await dbP.execute(
                            `SELECT id FROM authors WHERE name = '${author.name}' AND last_name = '${author.last_name}'`
                        );
                        if (result.length < 1) {
                            author["id"] = uuidv4();
                            let [result] = await dbP.execute(
                                "INSERT INTO authors (id, name, last_name) VALUES (?,?,?)",
                                [author.id, author.name, author.last_name]
                            );
                            return result;
                        }
                        return resolve(result[0].id);
                    });
                })
            );

            await dbP.execute(
                "INSERT INTO books (id, title, images, genre, max_order, price, publisher, language, year, description, authors) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                [
                    uuidv4(),
                    title,
                    tempImgs,
                    genre,
                    max_order,
                    price,
                    publisher,
                    language,
                    year,
                    desc,
                    authorsIds
                ]
            );

            res.send("new book created");
        })
    );

router
    .route("/:id")
    .post(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;

            const [book] = await dbP.execute(
                `SELECT * FROM books WHERE id = '${id}'`
            );
            const authorsIds = book[0].authors;

            const authors = await Promise.all(
                authorsIds.map((authorId) => {
                    return new Promise(async (resolve, reject) => {
                        const [author] = await dbP.execute(
                            `SELECT * FROM authors WHERE id = '${authorId}'`
                        );
                        return resolve(author[0]);
                    });
                })
            );
            res.send([book[0], authors]);
        })
    )
    .put(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const title = req.body.title;
            const genre = req.body.genre;
            const max_order = req.body.maxOrder;
            const price = req.body.price;
            const publisher = req.body.publisher;
            const language = req.body.language;
            const year = req.body.year;
            const description = req.body.desc;
            const id = req.body.bookId;
            const authors = req.body.authors;
            const imgs = req.body.images;

            const tempImgs = JSON.stringify(imgs);

            const authorsIds = await Promise.all(
                authors.map((author) => {
                    return new Promise(async (resolve, reject) => {
                        let [result] = await dbP.execute(
                            `SELECT id FROM authors WHERE name = '${author.name}' AND last_name = '${author.last_name}'`
                        );
                        if (result.length < 1) {
                            author["id"] = uuidv4();
                            let [result] = await dbP.execute(
                                "INSERT INTO authors (id, name, last_name) VALUES (?,?,?)",
                                [author.id, author.name, author.last_name]
                            );
                            return result;
                        }
                        return resolve(result[0].id);
                    });
                })
            );

            await dbP.execute(
                "UPDATE books SET title = ?, authors = ?, genre = ?, max_order = ?, price = ?, publisher = ?, language = ?, year = ?, description = ?, images = ? WHERE id = ?",
                [
                    title,
                    authorsIds,
                    genre,
                    max_order,
                    price,
                    publisher,
                    language,
                    year,
                    description,
                    tempImgs,
                    id
                ]
            );
            res.send("book updated");
        })
    )
    .delete(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;

            await dbP.execute("DELETE FROM books WHERE id = ?", [id]);
            res.send("book deleted");
        })
    );

module.exports = router;
