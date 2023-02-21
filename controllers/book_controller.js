const { v4: uuidv4 } = require("uuid");
const { dbPoolPromise } = require("../databaseMiddleware/mySqlConnection");
const conditionalArrayParse = require("../utils/conditionalArrayParse");

module.exports.findAll = async (req, res) => {
  const [result] = await dbPoolPromise.execute("SELECT * FROM books");
  let books = result.map((book) => {
    let newBook = { ...book };
    if (!Array.isArray(book.authors)) {
      newBook.authors = [...JSON.parse(book.authors)];
    }
    if (!Array.isArray(book.images)) {
      newBook.images = [...JSON.parse(book.images)];
    }
    return newBook;
  });
  res.send(books);
};

module.exports.add = async (req, res) => {
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

  const authorsIds = await populateAuthors(authors);

  const [newBook] = await dbPoolPromise.execute(
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
};

module.exports.findByid = async (req, res) => {
  const id = req.body.id;

  const [book] = await dbPoolPromise.execute(
    `SELECT * FROM books WHERE id = '${id}'`
  );
  const authorsIds = book[0].authors;

  let authors = await findAuthorsPerBook(authorsIds);

  let tempBook = { ...book[0] };
  tempBook.images = conditionalArrayParse(book[0].images);

  res.send([tempBook, authors]);
};

module.exports.editById = async (req, res) => {
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

  const authorsIds = await populateAuthors(authors);

  await dbPoolPromise.execute(
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
};

module.exports.deleteById = async (req, res) => {
  const id = req.body.id;

  await dbPoolPromise.execute("DELETE FROM books WHERE id = ?", [id]);
  res.send("book deleted");
};

async function fetchOrSaveAuthor(author) {
  let result;
  let [resultDB] = await dbPoolPromise.execute(
    `SELECT id FROM authors WHERE name = '${author.name}' AND last_name = '${author.last_name}'`
  );
  if (resultDB.length < 1) {
    author["id"] = uuidv4();
    await dbPoolPromise.execute(
      "INSERT INTO authors (id, name, last_name) VALUES (?,?,?)",
      [author.id, author.name, author.last_name]
    );
    result = author.id;
  } else {
    result = resultDB[0].id;
  }

  return result;
}

async function populateAuthors(authors) {
  let authorsIds = [];
  if (!Array.isArray(authors)) {
    return [];
  }
  let populate = new Promise((resolve, reject) => {
    authors.forEach(async (author, index, authors) => {
      let result = await fetchOrSaveAuthor(author);
      authorsIds.push(result);
      if (index === authors.length - 1) {
        resolve();
      }
    });
  });

  await populate;
  return authorsIds;
}

async function findAuthorsPerBook(ids) {
  let authors = [];
  let tempIds = [...ids];
  if (!Array.isArray(ids)) {
    tempIds = [...JSON.parse(ids)];
  }
  let populate = new Promise((resolve, resject) => {
    tempIds.forEach(async (id, index, ids) => {
      let author = await findAuthorById(id);
      authors.push(author);
      if (index === ids.length - 1) {
        resolve();
      }
    });
  });

  await populate;
  return authors;
}

async function findAuthorById(id) {
  const [author] = await dbPoolPromise.execute(
    `SELECT * FROM authors WHERE id = '${id}'`
  );

  return author[0];
}
