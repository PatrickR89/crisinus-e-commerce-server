const express = require("express");

const { dbAuth } = require("../mySqlConnection");
const { verifyJWT } = require("../JWT/jwtMiddleware");
const { logger } = require("../utils/winstonLogger");

const router = express.Router();

let dbP;

const connection = async () => {
    dbP = await dbAuth;
};

connection();

router.route("/").get(async (req, res) => {
    try {
        const [authors] = await dbP.execute("SELECT * FROM authors");
        res.send(authors);
    } catch (error) {
        logger.error(err);
    }
});
router
    .route("/:id")
    .post(verifyJWT, async (req, res) => {
        const id = req.body.id;

        try {
            const [author] = await dbP.execute(
                "SELECT * FROM authors WHERE id = ?",
                [id]
            );
            res.send(author);
        } catch (err) {
            logger.error(err);
        }
    })
    .put(verifyJWT, async (req, res) => {
        first_name = req.body.name;
        last_name = req.body.last_name;
        images = req.body.images;
        url = req.body.url;
        bio = req.body.bio;
        id = req.body.id;

        const tempImgs = JSON.stringify(images);

        try {
            const [editedAuthor] = await dbP.execute(
                "UPDATE authors SET name = ?, last_name =?, img =?, url =?, bio =? WHERE id =?",
                [first_name, last_name, tempImgs, url, bio, id]
            );

            res.send(editedAuthor);
        } catch (err) {
            logger.error(err);
        }
    })
    .delete(verifyJWT, async (req, res) => {
        const id = req.body.id;
        const tempId = JSON.stringify(id);

        try {
            const [author] = await dbP.execute(
                "SELECT * FROM authors WHERE id = ?",
                [id]
            );
            const [books] = await dbP.execute(
                `SELECT * FROM books WHERE JSON_CONTAINS(authors, '${tempId}')`
            );
            books.forEach(async (book) => {
                const newAuthors = book.authors.filter(
                    (author) => author !== id
                );
                const [newAuthorsList] = await dbP.execute(
                    "UPDATE books SET authors = ? WHERE id = ?",
                    [newAuthors, book.id]
                );
            });

            const [delAuthor] = await dbP.execute(
                "DELETE FROM authors WHERE id = ?",
                [id]
            );

            res.send(delAuthor);
        } catch (err) {
            logger.error(err);
        }
    });

module.exports = router;
