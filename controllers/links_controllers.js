const { dbPoolPromise } = require("../databaseMiddleware/mySqlConnection");

module.exports.findAll = async (req, res) => {
    const [links] = await dbPoolPromise.execute("SELECT * FROM anchor_links");
    res.send(links);
};

module.exports.findById = async (req, res) => {
    const id = req.body.id;

    const [link] = await dbPoolPromise.execute(
        "SELECT * FROM anchor_links WHERE id = ?",
        [id]
    );
    res.send(link);
};
module.exports.editById = async (req, res) => {
    const { link } = req.body;
    const { id } = req.params;

    await dbPoolPromise.execute(
        "UPDATE anchor_links SET link = ? WHERE id = ?",
        [link, id]
    );
};
