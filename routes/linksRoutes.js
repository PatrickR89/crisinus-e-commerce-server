const express = require("express");

const { dbPoolPromise } = require("../mySqlConnection");
const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");

const router = express.Router();

router
    .route("/")
    .get(
        catchRequestError(async (req, res) => {
            const [links] = await dbPoolPromise.execute(
                "SELECT * FROM anchor_links"
            );
            res.send(links);
        })
    )
    .post(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;

            const [link] = await dbPoolPromise.execute(
                "SELECT * FROM anchor_links WHERE id = ?",
                [id]
            );
            res.send(link);
        })
    );
router.put(
    "/:id",
    verifyJWT,
    catchRequestError(async (req, res) => {
        const { link } = req.body;
        const { id } = req.params;

        await dbPoolPromise.execute(
            "UPDATE anchor_links SET link = ? WHERE id = ?",
            [link, id]
        );
    })
);

module.exports = router;
