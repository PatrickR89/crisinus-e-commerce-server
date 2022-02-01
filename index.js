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

const idList = [];

const clearList = () => {
  idList.splice(0, idList.length);
  return idList;
};
const saveIds = (result) => {
  idList.push(result);
  return idList;
};

app.post("/addauthors", (req, res) => {
  const authors = req.body.authors;

  authors.forEach((author) => {
    db.query(
      `SELECT id FROM authors WHERE name = '${author.name}' AND last_name = '${author.last_name}'`,

      (err, result) => {
        if (err) {
          console.log(err);
        }

        if (result.length < 1) {
          author["id"] = uuidv4();
          db.query(
            "INSERT INTO authors (id, name, last_name) VALUES (?,?,?)",
            [author.id, author.name, author.last_name],
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                console.log(`inserted author ${author.name}`);
                saveIds(author.id);
                console.log(idList);
                return idList;
              }
            }
          );
        } else {
          saveIds(result[0].id);
          console.log(author.name);
          console.log(idList);
          return idList;
        }
      }
    );
  });

  res.send("authors added");
});

app.post("/addbook", (req, res) => {
  const title = req.body.title;
  const images = req.body.images;
  const genre = req.body.genre;
  const max_order = req.body.maxOrder;
  const price = req.body.price;
  const publisher = req.body.publisher;
  const language = req.body.language;
  const year = req.body.year;
  const desc = req.body.desc;

  let ids = JSON.stringify(
    idList.flat(1).map((singleId) => {
      return singleId;
    })
  );
  console.log(idList);
  console.log(ids);

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
      ids
    ],

    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("book inserted");
      }
    }
  );
  clearList();
});

app.get("/authorList", (req, res) => {
  db.query("SELECT * FROM authors", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.listen(3001, () => {
  console.log("app listening on port 3001");
});
