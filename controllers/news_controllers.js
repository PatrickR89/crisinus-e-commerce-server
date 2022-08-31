const { v4: uuidv4 } = require("uuid");

const { dbPoolPromise } = require("../databaseMiddleware/mySqlConnection");

module.exports.findAll = async (req, res) => {
  const [news] = await dbPoolPromise.execute("SELECT * FROM news");
  res.send(news);
};

module.exports.add = async (req, res) => {
  const title = req.body.title;
  const images = req.body.images;
  const text = req.body.text;

  const date = Date.now();
  const today = new Date(date);

  const [addNews] = await dbPoolPromise.execute(
    "INSERT INTO news (id, title, text, images, date) VALUES (?, ?, ?, ?, ?)",
    [uuidv4(), title, text, images, today]
  );

  res.send(addNews);
};

module.exports.findById = async (req, res) => {
  const id = req.body.id;
  const [newsById] = await dbPoolPromise.execute(
    "SELECT * FROM news WHERE id = ?",
    [id]
  );
  res.send(newsById);
};

module.exports.editById = async (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const images = req.body.images;
  const text = req.body.text;

  const date = Date.now();
  const today = new Date(date);

  const [editedNews] = await dbPoolPromise.execute(
    "UPDATE news SET title = ?, text = ?, images = ?, date = ? WHERE id = ?",
    [title, text, images, today, id]
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
