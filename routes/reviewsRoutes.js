const express = require("express");

const { v4: uuidv4 } = require("uuid");

const { dbAuth } = require("../mySqlConnection");
const { verifyJWT } = require("../JWT/jwtMiddleware");

const router = express.Router();

let dbP;

const connection = async () => {
  dbP = await dbAuth;
};

connection();

router.get("/bookList", async (req, res) => {
  const [bookList] = await dbP.execute("SELECT id, title FROM books");

  res.send(bookList);
});

router.post("/addreview", verifyJWT, async (req, res) => {
  const bookId = req.body.book;
  const rating_title = req.body.rating_title;
  const rating = req.body.rating;
  const reviewer = req.body.reviewer;
  const review = req.body.review;

  const [bookTitle] = await dbP.execute(
    "SELECT title FROM books WHERE id = ?",
    [bookId]
  );

  const [newRating] = await dbP.execute(
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
});

router.get("/reviewsList", async (req, res) => {
  const [reviewsList] = await dbP.execute("SELECT * FROM ratings");
  res.send(reviewsList);
});

router.post("/getInitialReview", verifyJWT, async (req, res) => {
  const id = req.body.id;

  const [initialReview] = await dbP.execute(
    "SELECT * FROM ratings WHERE id =?",
    [id]
  );
  res.send(initialReview[0]);
});

router.put("/editreview", verifyJWT, async (req, res) => {
  const rating_id = req.body.id;
  const bookId = req.body.book;
  const rating_title = req.body.rating_title;
  const rating = req.body.rating;
  const reviewer = req.body.reviewer;
  const review = req.body.review;

  const [bookTitle] = await dbP.execute(
    "SELECT title FROM books WHERE id = ?",
    [bookId]
  );

  const [editedReview] = await dbP.execute(
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
});

router.delete("/deletereview", verifyJWT, async (req, res) => {
  const id = req.body.id;
  const [delItem] = await dbP.execute("DELETE FROM ratings WHERE id = ?", [id]);

  res.send(delItem);
});

module.exports = router;
