const express = require("express");

const { dbAuth } = require("../mySqlConnection");
const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");

const router = express.Router();

let dbP;

const connection = async () => {
    dbP = await dbAuth;
};

connection();

router
    .route("/")
    .get(
        catchRequestError(async (req, res) => {
            const [links] = await dbP.execute("SELECT * FROM anchor_links");
            res.send(links);
        })
    )
    .post(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;

            const [link] = await dbP.execute(
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

        await dbP.execute("UPDATE anchor_links SET link = ? WHERE id = ?", [
            link,
            id
        ]);
    })
);

module.exports = router;
