const { dbPoolPromise } = require("../databaseMiddleware/mySqlConnection");

module.exports.findAll = async (req, res) => {
    const [authors] = await dbPoolPromise.execute("SELECT * FROM authors");
    res.send(authors);
};

module.exports.findById = async (req, res) => {
    const id = req.body.id;

    const [author] = await dbPoolPromise.execute(
        "SELECT * FROM authors WHERE id = ?",
        [id]
    );
    res.send(author);
};

module.exports.editById = async (req, res) => {
    let first_name = req.body.name;
    let last_name = req.body.last_name;
    let images = req.body.images;
    let url = req.body.url;
    let bio = req.body.bio;
    let id = req.body.id;

    const tempImgs = JSON.stringify(images);

    await dbPoolPromise.execute(
        "UPDATE authors SET name = ?, last_name =?, img =?, url =?, bio =? WHERE id =?",
        [first_name, last_name, tempImgs, url, bio, id]
    );

    res.send("author edited");
};

module.exports.deleteById = async (req, res) => {
    const id = req.body.id;
    const tempId = JSON.stringify(id);

    const [books] = await dbPoolPromise.execute(
        `SELECT * FROM books WHERE JSON_CONTAINS(authors, '${tempId}')`
    );
    books.forEach(async (book) => {
        const newAuthors = book.authors.filter((author) => author !== id);

        await dbPoolPromise.execute(
            "UPDATE books SET authors = ? WHERE id = ?",
            [newAuthors, book.id]
        );
    });

    await dbPoolPromise.execute("DELETE FROM authors WHERE id = ?", [id]);

    res.send("author deleted");
};
