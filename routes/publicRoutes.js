const express = require("express");
const { dbAuth } = require("../mySqlConnection");

const { catchRequestError } = require("../utils/catchAsync");
const { validateMessage } = require("../utils/middleware");

const router = express.Router();

let dbP;

const connection = async () => {
    dbP = await dbAuth;
};

connection();

router.post(
    "/submitcart",
    catchRequestError(async (req, res) => {
        let orderString = JSON.stringify(req.body);

        await dbP.execute(
            "INSERT INTO product_orders ( product_order, order_date, order_status) VALUES (?,DATE_FORMAT(NOW(), '%T %d-%m-%Y'),?)",
            [orderString, "NEW ORDER"]
        );

        res.send("Order submitted");
    })
);

router.post(
    "/submitmessage",
    validateMessage,
    catchRequestError(async (req, res) => {
        const message = req.body.contactForm;
        await dbP.execute(
            "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
            [message.contactName, message.contactEmail, message.contactMessage]
        );
        res.json({ status: 200, message: "message sent" });
    })
);

router
    .route("/books")
    .get(
        catchRequestError(async (req, res) => {
            const [books] = await dbP.execute("SELECT * FROM books");

            await Promise.all(
                books.map(async (book) => {
                    const authorNames = Promise.all(
                        book.authors.map(async (author) => {
                            const authorDB = await dbP
                                .execute(
                                    "SELECT name, last_name FROM authors WHERE id = ?",
                                    [author]
                                )
                                .then((value) => {
                                    return value[0][0];
                                })
                                .catch((err) => console.log(err));
                            return authorDB;
                        })
                    );
                    const authors = await authorNames;
                    return (book.authors = authors);
                })
            );

            res.json(books);
        })
    )
    .post(
        catchRequestError(async (req, res) => {
            const id = req.body.id;
            const [book] = await dbP.execute(
                "SELECT * FROM books WHERE id = ?",
                [id]
            );

            const newBook = book[0];

            const authorNames = Promise.all(
                book[0].authors.map(async (author) => {
                    const authorDB = await dbP
                        .execute(
                            "SELECT name, last_name FROM authors WHERE id = ?",
                            [author]
                        )
                        .then((value) => {
                            return value[0][0];
                        })
                        .catch((err) => console.log(err));
                    return authorDB;
                })
            );
            newBook.authors = await authorNames;

            res.send(newBook);
        })
    );

router
    .route("/gifts")
    .get(
        catchRequestError(async (req, res) => {
            const [gifts] = await dbP.execute(
                "SELECT id, name, price, images FROM giftshop"
            );
            res.send(gifts);
        })
    )
    .post(
        catchRequestError(async (req, res) => {
            const id = req.body.id;
            const [gift] = await dbP.execute(
                "SELECT * FROM giftshop WHERE id = ?",
                [id]
            );
            res.send(gift);
        })
    );

router
    .route("/news")
    .get(
        catchRequestError(async (req, res) => {
            const [news] = await dbP.execute("SELECT * FROM news");
            res.send(news);
        })
    )
    .post(
        catchRequestError(async (req, res) => {
            const id = req.body.id;
            const [news] = await dbP.execute(
                "SELECT * FROM news WHERE id = ?",
                [id]
            );
            res.send(news);
        })
    );

router.get(
    "/informations",
    catchRequestError(async (req, res) => {
        const [informations] = await dbP.execute("SELECT * FROM info_pages");
        res.send(informations);
    })
);

router.get(
    "/reviews",
    catchRequestError(async (req, res) => {
        const [reviews] = await dbP.execute("SELECT * FROM ratings");
        res.send(reviews);
    })
);

router
    .route("/authors")
    .get(
        catchRequestError(async (req, res) => {
            const [authors] = await dbP.execute(
                "SELECT id, name, last_name FROM authors"
            );
            const [books] = await dbP.execute(
                "SELECT id, title, images, price, authors FROM books"
            );

            res.send([authors, books]);
        })
    )
    .post(
        catchRequestError(async (req, res) => {
            const authorID = req.body.author;
            const [author] = await dbP.execute(
                "SELECT * FROM authors WHERE id = ?",
                [authorID]
            );
            res.send(author);
        })
    );

router.route("/links").get(
    catchRequestError(async (req, res) => {
        const [links] = await dbP.execute("SELECT * FROM anchor_links");
        res.send(links);
    })
);

module.exports = router;
