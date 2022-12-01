const { dbPoolPromise } = require("../databaseMiddleware/mySqlConnection");

module.exports.add = async (req, res) => {
  const { dimensions } = req.body;
  const { product_id, height, width, depth, weight } = dimensions;

  const [addedDimension] = await dbPoolPromise.execute(
    "INSERT INTO product_dimensions (product_id, height, width, depth, weight) VALUES (?, ?, ?, ?, ?)",
    [product_id, height, width, depth, weight]
  );
  res.send(addedDimension);
};

module.exports.findById = async (req, res) => {
  const id = req.body.id;

  const [itemDimensions] = await dbPoolPromise.execute(
    "SELECT * FROM product_dimensions WHERE product_id = ?",
    [id]
  );

  res.send(itemDimensions);
};

module.exports.editById = async (req, res) => {
  const { dimensions } = req.body;
  const { product_id, height, width, depth, weight } = dimensions;

  const [editedItem] = await dbPoolPromise.execute(
    " UPDATE product_dimensions SET height = ?, width = ?, depth = ?, weight = ? WHERE product_id = ?",
    [height, width, depth, weight, product_id]
  );

  res.send(editedItem);
};

module.exports.deleteById = async (req, res) => {
  const id = req.body.id;

  const [itemDimensions] = await dbPoolPromise.execute(
    "DELETE FROM product_dimensions WHERE product_id = ?",
    [id]
  );

  res.send(itemDimensions);
};
