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
            const [reviewsList] = await dbPoolPromise.execute(
                "SELECT * FROM ratings"
            );
            res.send(reviewsList);
        })
    )
    .post(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const bookId = req.body.book;
            const rating_title = req.body.rating_title;
            const rating = req.body.rating;
            const reviewer = req.body.reviewer;
            const review = req.body.review;

            const [bookTitle] = await dbPoolPromise.execute(
                "SELECT title FROM books WHERE id = ?",
                [bookId]
            );

            const [newRating] = await dbPoolPromise.execute(
                "INSERT INTO ratings (id, book_id, book_title, rating_title, rating, reviewer, review) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    uuidv4(),
                    bookId,
                    bookTitle[0].title,
                    rating_title,
                    rating,
                    reviewer,
                    review
                ]
            );
            res.send(newRating);
        })
    );

router
    .route("/:id")
    .post(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;

            const [initialReview] = await dbPoolPromise.execute(
                "SELECT * FROM ratings WHERE id =?",
                [id]
            );
            res.send(initialReview[0]);
        })
    )
    .put(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const rating_id = req.body.id;
            const bookId = req.body.book;
            const rating_title = req.body.rating_title;
            const rating = req.body.rating;
            const reviewer = req.body.reviewer;
            const review = req.body.review;

            const [bookTitle] = await dbPoolPromise.execute(
                "SELECT title FROM books WHERE id = ?",
                [bookId]
            );

            const [editedReview] = await dbPoolPromise.execute(
                "UPDATE ratings SET book_id = ?, book_title =?, rating_title =?, rating =?, reviewer =?, review =? WHERE id =?",
                [
                    bookId,
                    bookTitle[0].title,
                    rating_title,
                    rating,
                    reviewer,
                    review,
                    rating_id
                ]
            );
        })
    )
    .delete(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;
            const [delItem] = await dbPoolPromise.execute(
                "DELETE FROM ratings WHERE id = ?",
                [id]
            );

            res.send(delItem);
        })
    );

module.exports = router;
