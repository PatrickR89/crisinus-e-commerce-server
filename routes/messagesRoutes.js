const express = require("express");
const { dbAuth } = require("../mySqlConnection");
const router = express.Router();
const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");

let dbP;

const connection = async () => {
    dbP = await dbAuth;
};

connection();

router.route("/").get(
    verifyJWT,
    catchRequestError(async (req, res) => {
        const [messages] = await dbP.execute(
            "SELECT id, name, email, date, status FROM contact_messages"
        );
        res.send(messages);
    })
);
router
    .route("/:id")
    .get(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = JSON.parse(req.params.id);

            const [message] = await dbP.execute(
                "SELECT * FROM contact_messages WHERE id = ?",
                [id]
            );
            res.send(message[0]);
        })
    )
    .put(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = JSON.parse(req.params.id);
            const status = req.body.status;

            await dbP.execute(
                "UPDATE contact_messages SET status = ? WHERE id = ?",
                [status, id]
            );

            res.send("Order status updated");
        })
    )
    .delete(
        verifyJWT,
        catchRequestError(async (req, res) => {
            const id = req.body.id;

            await dbP.execute("DELETE FROM contact_messages WHERE id = ?", [
                id
            ]);

            res.send("Order deleted");
        })
    );

module.exports = router;
