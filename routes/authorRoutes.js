const express = require("express");

const { dbAuth } = require("../mySqlConnection");
const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");

const router = express.Router();

let dbP;

const connection = async () => {
    dbP = await dbAuth;
};

connection();

router.route("/").get(
    catchRequestError(async (req, res) => {
        const [authors] = await dbP.execute("SELECT * FROM authors");
        res.send(authors);
    })
);
router
    .route("/:id")
    .post(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;

            const [author] = await dbP.execute(
                "SELECT * FROM authors WHERE id = ?",
                [id]
            );
            res.send(author);
        })
    )
    .put(
        verifyJWT,
        catchRequestError(async (req, res) => {
            first_name = req.body.name;
            last_name = req.body.last_name;
            images = req.body.images;
            url = req.body.url;
            bio = req.body.bio;
            id = req.body.id;

            const tempImgs = JSON.stringify(images);

            await dbP.execute(
                "UPDATE authors SET name = ?, last_name =?, img =?, url =?, bio =? WHERE id =?",
                [first_name, last_name, tempImgs, url, bio, id]
            );

            res.send("author edited");
        })
    )
    .delete(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;
            const tempId = JSON.stringify(id);

            const [books] = await dbP.execute(
                `SELECT * FROM books WHERE JSON_CONTAINS(authors, '${tempId}')`
            );
            books.forEach(async (book) => {
                const newAuthors = book.authors.filter(
                    (author) => author !== id
                );

                await dbP.execute("UPDATE books SET authors = ? WHERE id = ?", [
                    newAuthors,
                    book.id
                ]);
            });

            await dbP.execute("DELETE FROM authors WHERE id = ?", [id]);

            res.send("author deleted");
        })
    );

module.exports = router;
