const express = require("express");

const { v4: uuidv4 } = require("uuid");

const { dbPoolPromise } = require("../mySqlConnection");
const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");
const router = express.Router();

router.route("/").get(
    catchRequestError(async (req, res) => {
        const [info] = await dbPoolPromise.execute("SELECT * FROM info_pages");
        res.send(info);
    })
);

router.post(
    "/reset",
    verifyJWT,
    catchRequestError(async (req, res) => {
        await dbPoolPromise.execute("TRUNCATE TABLE info_pages");
        await dbPoolPromise.execute(
            `INSERT INTO info_pages (id, title, show_title, images, content) VALUES ('${uuidv4()}', 'about_us','About Us', '[]', '...'), ('${uuidv4()}', 'how_to_order','How to order', '[]', '...'), ('${uuidv4()}', 'general_information','General Information', '[]', '...'), ('${uuidv4()}', 'payment_methods','Payment Methods and Shipping', '[]', '...'), ('${uuidv4()}', 'disclaimer','Disclaimer', '[]', '...');`
        );
    })
);

router
    .route("/:id")
    .post(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;
            const [pageById] = await dbPoolPromise.execute(
                "SELECT * FROM info_pages WHERE id = ?",
                [id]
            );

            res.send(pageById);
        })
    )
    .put(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;
            const images = req.body.images;
            const content = req.body.content;

            await dbPoolPromise.execute(
                "UPDATE info_pages SET images = ?, content = ? WHERE id = ?",
                [images, content, id]
            );
        })
    );

module.exports = router;
