const { v4: uuidv4 } = require("uuid");
const conditionalArrayParse = require("../utils/conditionalArrayParse");
const { dbPoolPromise } = require("../databaseMiddleware/mySqlConnection");

module.exports.findAll = async (req, res) => {
  const [news] = await dbPoolPromise.execute("SELECT * FROM news");
  res.send(news.reverse());
};

module.exports.add = async (req, res) => {
  const title = req.body.title;
  const images = req.body.images;
  const text = req.body.text;

  const date = Date.now();
  const today = new Date(date);
  let tempImages = JSON.stringify(images)

  const [addNews] = await dbPoolPromise.execute(
    "INSERT INTO news (id, title, text, images, date) VALUES (?, ?, ?, ?, ?)",
    [uuidv4(), title, text, tempImages, today]
  );

  res.send(addNews);
};

module.exports.findById = async (req, res) => {
  const id = req.body.id;
  const [newsById] = await dbPoolPromise.execute(
    "SELECT * FROM news WHERE id = ?",
    [id]
  );

  let tempNews = { ...newsById };
  tempNews[0].images = conditionalArrayParse(newsById[0].images);

  res.send(tempNews);
};

module.exports.editById = async (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const images = req.body.images;
  const text = req.body.text;

  const date = Date.now();
  const today = new Date(date);
  const tempImages = JSON.stringify(images)	

  const [editedNews] = await dbPoolPromise.execute(
    "UPDATE news SET title = ?, text = ?, images = ?, date = ? WHERE id = ?",
    [title, text, tempImages, today, id]
  );

  res.send(editedNews);
};

module.exports.deleteById = async (req, res) => {
  const id = req.body.id;
  const [delItem] = await dbPoolPromise.execute(
    "DELETE FROM news WHERE id = ?",
    [id]
  );

  res.send(delItem);
};
