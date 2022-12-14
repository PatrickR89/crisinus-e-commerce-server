const { dbPoolPromise } = require("../databaseMiddleware/mySqlConnection");

module.exports.findById = async (req, res) => {
  const id = req.body.id;

  const [bookProps] = await dbPoolPromise.execute(
    "SELECT * FROM book_properties WHERE id = ?",
    [id]
  );

  res.json(bookProps);
};

module.exports.add = async (req, res) => {
  const { id, cover, pages } = req.body.properties;

  const [newProp] = dbPoolPromise.execute(
    "INSERT INTO book_properties (id, cover, pages) VALUES (?, ?, ?)",
    [id, cover, pages]
  );
  res.send(newProp);
};

module.exports.editById = async (req, res) => {
  const { id, cover, pages } = req.body.properties;

  const [editProp] = dbPoolPromise.execute(
    "UPDATE book_properties SET cover = ?, pages = ? WHERE id = ?",
    [cover, pages, id]
  );

  res.send(editProp);
};

module.exports.deleteById = async (req, res) => {
  const { id } = req.body.properties;

  const [deleteProp] = dbPoolPromise.execute(
    "DELETE FROM book_properties WHERE product_id = ?",
    [id]
  );

  res.send(deleteProp);
};
