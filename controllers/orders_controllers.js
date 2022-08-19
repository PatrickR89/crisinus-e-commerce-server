const { dbPoolPromise } = require("../mySqlConnection");

module.exports.findAll = async (req, res) => {
    const [readOrder] = await dbPoolPromise.execute(
        "SELECT id, order_date, order_status FROM product_orders"
    );
    res.send(readOrder);
};

module.exports.findById = async (req, res) => {
    const id = req.body.id;

    const [readOrder] = await dbPoolPromise.execute(
        "SELECT * FROM product_orders WHERE id = ?",
        [id]
    );
    res.send(readOrder);
};
module.exports.editById = async (req, res) => {
    const id = req.body.id;
    const status = req.body.status;

    await dbPoolPromise.execute(
        "UPDATE product_orders SET order_status = ? WHERE id = ?",
        [status, id]
    );

    res.send("Order status updated");
};
module.exports.deleteById = async (req, res) => {
    const id = req.body.id;

    await dbPoolPromise.execute("DELETE FROM product_orders WHERE id = ?", [
        id
    ]);

    res.send("Order deleted");
};

module.exports.status = async (req, res) => {
    const [status] = await dbPoolPromise.execute(
        "SELECT order_status FROM product_orders"
    );
    const validationArray = [];
    status.map((order) => {
        if (order.order_status === "NEW ORDER") {
            validationArray.push(true);
        } else {
            validationArray.push(false);
        }
    });
    const validationValue = validationArray.includes(true);

    res.send(validationValue);
};
