const express = require("express");

const { dbAuth } = require("../mySqlConnection");

const router = express.Router();

let dbP;

const connection = async () => {
  dbP = await dbAuth;
};

connection();

router.get("/authorlist", async (req, res) => {
  const [authors] = await dbP.execute("SELECT * FROM authors");
  res.send(authors);
});

router.post("/getauthor", async (req, res) => {
  const id = req.body.id;

  const [author] = await dbP.execute("SELECT * FROM authors WHERE id = ?", [
    id
  ]);
  res.send(author);
});

router.put("/editauthor", async (req, res) => {
  first_name = req.body.name;
  last_name = req.body.last_name;
  images = req.body.images;
  url = req.body.url;
  bio = req.body.bio;
  id = req.body.id;

  const tempImgs = JSON.stringify(images);

  const [editedAuthor] = await dbP.execute(
    "UPDATE authors SET name = ?, last_name =?, img =?, url =?, bio =? WHERE id =?",
    [first_name, last_name, tempImgs, url, bio, id]
  );

  res.send(editedAuthor);
});

router.delete("/deleteauthor", async (req, res) => {
  const id = req.body.id;
  const tempId = JSON.stringify(id);
  const [author] = await dbP.execute("SELECT * FROM authors WHERE id = ?", [
    id
  ]);
  const [books] = await dbP.execute(
    `SELECT * FROM books WHERE JSON_CONTAINS(authors, '${tempId}')`
  );
  books.forEach(async (book) => {
    const newAuthors = book.authors.filter((author) => author !== id);
    const [newAuthorsList] = await dbP.execute(
      "UPDATE books SET authors = ? WHERE id = ?",
      [newAuthors, book.id]
    );
  });

  const [delAuthor] = await dbP.execute("DELETE FROM authors WHERE id = ?", [
    id
  ]);

  res.send(delAuthor);
});

module.exports = router;
