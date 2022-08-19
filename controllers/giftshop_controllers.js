const { v4: uuidv4 } = require("uuid");
const { dbPoolPromise } = require("../mySqlConnection");

module.exports.findAll = async (req, res) => {
    try {
        const [result] = await dbPoolPromise.execute("SELECT * FROM giftshop");
        res.send(result);
    } catch (err) {
        winston.error(err);
    }
};

module.exports.add = async (req, res) => {
    const name = req.body.name;
    const price = req.body.price;
    const max_order = req.body.max_order;
    const images = req.body.images;
    const description = req.body.description;

    const [addedItem] = await dbPoolPromise.execute(
        "INSERT INTO giftshop (id, name, price, max_order, images, description) VALUES (?, ?, ?, ?, ?, ?)",
        [uuidv4(), name, price, max_order, images, description]
    );
    res.send(addedItem);
};

module.exports.findById = async (req, res) => {
    const id = req.body.id;

    const [item] = await dbPoolPromise.execute(
        "SELECT * FROM giftshop WHERE id = ?",
        [id]
    );
    res.send(item);
};

module.exports.editById = async (req, res) => {
    const id = req.body.id;
    const name = req.body.name;
    const price = req.body.price;
    const max_order = req.body.max_order;
    const images = req.body.images;
    const description = req.body.description;

    const tempImgs = JSON.stringify(images);
    const [editedItem] = await dbPoolPromise.execute(
        "UPDATE giftshop SET name = ?, price =?, max_order =?, images =?, description =? WHERE id =?",
        [name, price, max_order, tempImgs, description, id]
    );

    res.send(editedItem);
};

module.exports.deleteById = async (req, res) => {
    const id = req.body.id;

    const [delItem] = await dbPoolPromise.execute(
        "DELETE FROM giftshop WHERE id = ?",
        [id]
    );

    res.send(delItem);
};
