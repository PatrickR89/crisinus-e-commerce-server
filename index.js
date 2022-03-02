if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { v4: uuidv4 } = require("uuid");

const express = require("express");
const mysql = require("mysql2");
const mysqlPromise = require("mysql2/promise");
const bluebird = require("bluebird");
const cors = require("cors");
const fse = require("fs-extra");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "uploads");
  },
  filename: (req, file, callBack) => {
    callBack(null, `${file.originalname}`);
  }
});

// image url -> req.file.path

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  }
});

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const db = mysql.createConnection({
  user: process.env.MYSQL_USER,
  host: process.env.MYSQL_HOST,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

let dbP;

const main = async () => {
  dbP = await mysqlPromise.createConnection({
    user: process.env.MYSQL_USER,
    host: process.env.MYSQL_HOST,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    Promise: bluebird
  });
};

main();

app.post("/books/addimages", upload.array("images", 5), (req, res) => {
  const fileList = req.files;
  console.log(fileList);
  res.send(fileList);
});

app.post("/books/deleteimages", (req, res) => {
  const imgUrl = req.body.url;
  const tmpImgUrl = JSON.stringify(imgUrl);
  console.log(tmpImgUrl);
  // fse.remove(tmpImgUrl, (err) => {
  //   if (err) return console.log(err);
  //   console.log("success");
  // });
});

app.post("/books/addbook", async (req, res) => {
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

  const [newBook] = await dbP.execute(
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
  res.send(newBook);
  // clearList();
});

app.get("/books/authorList", async (req, res) => {
  db.query("SELECT * FROM authors", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/books/booklist", (req, res) => {
  db.query("SELECT * FROM books", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/books/singlebook", async (req, res) => {
  const id = req.body.id;

  const [book] = await dbP.execute(`SELECT * FROM books WHERE id = '${id}'`);
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
});

app.post("/books/editbook", async (req, res) => {
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

  const [bookRes] = await dbP.execute(
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
  res.send(bookRes);
});

app.listen(3001, () => {
  console.log("app listening on port 3001");
});
