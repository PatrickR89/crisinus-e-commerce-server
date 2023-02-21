const { dbPoolPromise } = require("../databaseMiddleware/mySqlConnection");
const { logger } = require("../utils/winstonLogger");

module.exports.submitCart = async (req, res) => {
  let orderString = JSON.stringify(req.body);

  await dbPoolPromise.execute(
    "INSERT INTO product_orders ( product_order, order_date, order_status) VALUES (?,DATE_FORMAT(NOW(), '%T %d-%m-%Y'),?)",
    [orderString, "NEW ORDER"]
  );

  res.send("Order submitted");
};

module.exports.submitMessage = async (req, res) => {
  const message = req.body.contactForm;
  await dbPoolPromise.execute(
    "INSERT INTO contact_messages (name, email, message, date, status) VALUES (?, ?, ?, DATE_FORMAT(NOW(), '%T %d-%m-%Y'), ?)",
    [message.contactName, message.contactEmail, message.contactMessage, "NEW"]
  );
  res.json({ status: 200, message: "message sent" });
};

module.exports.books = async (req, res) => {
  const [books] = await dbPoolPromise.execute("SELECT * FROM books");

  const [authorsToAssign] = await dbPoolPromise.execute(
    "SELECT id, name, last_name FROM authors"
  );

  let assignedBooks = await assignAuthorsById(books, authorsToAssign);

  let tempBooks = assignedBooks.map((book) => {
    let tempBook = { ...book };
    if (!Array.isArray(book.images)) {
      tempBook.images = [...JSON.parse(book.images)];
    }
    return tempBook;
  });
  res.send(tempBooks);
};

const assignAuthorsById = async (books, authorsToAssign) => {
  let assigned = [];

  let promise = new Promise((resolve, reject) => {
    books.forEach(async (book, index, array) => {
      const authors = await filterAuthors(book.authors, authorsToAssign);
      let newBook = { ...book };
      newBook.authors = authors;
      assigned.push(newBook);

      if (index === array.length - 1) {
        resolve();
      }
    });
  });

  await promise;
  return assigned;
};

const filterAuthors = async (authors, authorsToAssign) => {
  let filtered = [];
  let tempAuthors = [...authors];
  if (!Array.isArray(authors)) {
    tempAuthors = [...JSON.parse(authors)];
  }
  let promise = new Promise((resolve, reject) => {
    tempAuthors.forEach(async (id, index, array) => {
      const filteredAuthor = await authorsToAssign.filter(
        (aut) => aut.id === id
      );
      let tempAuthor = [...filteredAuthor];
      if (!Array.isArray(filteredAuthor)) {
        tempAuthor = [...JSON.parse(filteredAuthor)];
      }
      filtered.push(tempAuthor[0]);
      if (index === array.length - 1) {
        resolve();
      }
    });
  });

  await promise;
  return filtered;
};

module.exports.bookById = async (req, res) => {
  const id = req.body.id;
  const [book] = await dbPoolPromise.execute(
    "SELECT * FROM books WHERE id = ?",
    [id]
  );

  const newBook = book[0];

  let tempAuthors = await newBook.authors;
  let authors = await populateAuthors(tempAuthors);

  newBook.authors = authors;

  if (!Array.isArray(book[0].images)) {
    newBook.images = [...JSON.parse(book[0].images)];
  }

  res.send(newBook);
};

async function populateAuthors(inputAuthors) {
  let authors = [];
  let tempAuthors = [...inputAuthors];
  if (!Array.isArray(inputAuthors)) {
    tempAuthors = [...JSON.parse(inputAuthors)];
  }
  let promise = new Promise((resolve, reject) => {
    tempAuthors.forEach(async (author, index, array) => {
      let tempAuthor = await fetchAuthorsById(author);
      authors.push(tempAuthor);
      if (index === array.length - 1) {
        resolve();
      }
    });
  });

  await promise;
  return authors;
}

async function fetchAuthorsById(id) {
  const [authorFromDB] = await dbPoolPromise.execute(
    "SELECT id, name, last_name FROM authors WHERE id = ?",
    [id]
  );
  return authorFromDB[0];
}

module.exports.gifts = async (req, res) => {
  const [gifts] = await dbPoolPromise.execute(
    "SELECT id, name, price, images FROM giftshop"
  );

  let tempGifts = gifts.map((gift) => {
    let tempGift = { ...gift };
    tempGift.images = conditionalArrayParse(gift.images);
    return tempGift;
  });

  res.send(tempGifts);
};

module.exports.giftById = async (req, res) => {
  const id = req.body.id;
  const [gift] = await dbPoolPromise.execute(
    "SELECT * FROM giftshop WHERE id = ?",
    [id]
  );

  let tempGift = { ...gift };
  tempGift[0].images = conditionalArrayParse(gift[0].images);
  console.log(tempGift);

  res.send(tempGift);
};

module.exports.news = async (req, res) => {
  const [news] = await dbPoolPromise.execute("SELECT * FROM news");

  let tempNews = news.map((singleNews) => {
    let temp = singleNews;
    temp.images = conditionalArrayParse(singleNews.images);

    return temp;
  });

  res.send(tempNews);
};

module.exports.newsById = async (req, res) => {
  const id = req.body.id;
  const [news] = await dbPoolPromise.execute(
    "SELECT * FROM news WHERE id = ?",
    [id]
  );

  let tempNews = { ...news };
  tempNews[0].images = conditionalArrayParse(news[0].images);

  res.send(tempNews);
};

module.exports.info = async (req, res) => {
  const pageName = req.body.pageName;
  const [infoPage] = await dbPoolPromise.execute(
    "SELECT * FROM info_pages WHERE title = ?",
    [pageName]
  );

  let tempPage = { ...infoPage };
  tempPage[0].images = conditionalArrayParse(infoPage[0].images);

  res.send(tempPage);
};

module.exports.reviews = async (req, res) => {
  const [reviews] = await dbPoolPromise.execute("SELECT * FROM ratings");
  res.send(reviews);
};

module.exports.authors = async (req, res) => {
  const [authors] = await dbPoolPromise.execute(
    "SELECT id, name, last_name FROM authors"
  );
  const [books] = await dbPoolPromise.execute(
    "SELECT id, title, images, price, authors FROM books"
  );

  let tempBooks = books.map((book) => {
    let tempBook = { ...book };
    tempBook.images = conditionalArrayParse(book.images);
    tempBook.authors = conditionalArrayParse(book.authors);
    return tempBook;
  });

  res.send([authors, tempBooks]);
};

module.exports.authorById = async (req, res) => {
  const authorID = req.body.author;
  const [author] = await dbPoolPromise.execute(
    "SELECT * FROM authors WHERE id = ?",
    [authorID]
  );

  let tempAuthor = { ...author };

  tempAuthor[0].img = conditionalArrayParse(author[0].img);

  res.send(tempAuthor);
};

module.exports.links = async (req, res) => {
  const [links] = await dbPoolPromise.execute("SELECT * FROM anchor_links");
  res.send(links);
};

module.exports.dimensions = async (req, res) => {
  const id = req.body.id;

  const [itemDimensions] = await dbPoolPromise.execute(
    "SELECT * FROM product_dimensions WHERE product_id = ?",
    [id]
  );

  res.send(itemDimensions);
};

function conditionalArrayParse(array) {
  let newArray = [...array];

  if (!Array.isArray(array)) {
    newArray = [...JSON.parse(array)];
  }

  return newArray;
}
