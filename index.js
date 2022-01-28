if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { v4: uuidv4 } = require("uuid");

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  user: process.env.MYSQL_USER,
  host: process.env.MYSQL_HOST,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

app.post("/create", (req, res) => {
  const title = req.body.title;
  const authors = req.body.authors;
  const images = req.body.images;
  const genre = req.body.genre;
  const max_order = req.body.maxOrder;
  const price = req.body.price;
  const publisher = req.body.publisher;
  const language = req.body.language;
  const year = req.body.year;
  const desc = req.body.desc;

  console.log(req.body);

  authors.forEach((author) => {
    author["id"] = uuidv4();
    return author;
  });

  const authorsIds = JSON.stringify(
    authors.map((author) => {
      return author.id;
    })
  );

  console.log(authorsIds);
  authors.forEach((author) => {
    db.query(
      "INSERT INTO authors (id, name, last_name) VALUES (?,?,?)",
      [author.id, author.name, author.last_name],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          console.log("inserted author");
        }
      }
    );
  });
  db.query(
    "INSERT INTO books (id, title, images, genre, max_order, price, publisher, language, year, description, authors) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [
      uuidv4(),
      title,
      images,
      genre,
      max_order,
      price,
      publisher,
      language,
      year,
      desc,
      authorsIds
    ],

    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("books inserted");
      }
    }
  );
});

app.listen(3001, () => {
  console.log("app listening on port 3001");
});
