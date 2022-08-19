const { dbPoolPromise } = require("../mySqlConnection");

module.exports.findAll = async (req, res) => {
    const [messages] = await dbPoolPromise.execute(
        "SELECT id, name, email, date, status FROM contact_messages"
    );
    res.send(messages);
};

module.exports.findById = async (req, res) => {
    const id = JSON.parse(req.params.id);

    const [message] = await dbPoolPromise.execute(
        "SELECT * FROM contact_messages WHERE id = ?",
        [id]
    );
    res.send(message[0]);
};

module.exports.editById = async (req, res) => {
    const id = JSON.parse(req.params.id);
    const status = req.body.status;

    await dbPoolPromise.execute(
        "UPDATE contact_messages SET status = ? WHERE id = ?",
        [status, id]
    );

    res.send("Order status updated");
};

module.exports.deleteById = async (req, res) => {
    const id = req.body.id;

    await dbPoolPromise.execute("DELETE FROM contact_messages WHERE id = ?", [
        id
    ]);

    res.send("Order deleted");
};
