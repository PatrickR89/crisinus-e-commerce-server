const express = require("express");
const { dbAuth } = require("../mySqlConnection");
const router = express.Router();
const { verifyJWT } = require("../JWT/jwtMiddleware");

let dbP;

const connection = async () => {
    dbP = await dbAuth;
};

connection();

router.route("/").get(verifyJWT, async (req, res) => {
    const [readOrder] = await dbP.execute(
        "SELECT id, order_date, order_status FROM product_orders"
    );
    res.send(readOrder);
});
router
    .route("/:id")
    .post(verifyJWT, async (req, res) => {
        const id = req.body.id;

        const [readOrder] = await dbP.execute(
            "SELECT * FROM product_orders WHERE id = ?",
            [id]
        );
        res.send(readOrder);
    })
    .put(verifyJWT, async (req, res) => {
        const id = req.body.id;
        const status = req.body.status;

        await dbP.execute(
            "UPDATE product_orders SET order_status = ? WHERE id = ?",
            [status, id]
        );

        res.send("Order status updated");
    })
    .delete(verifyJWT, async (req, res) => {
        const id = req.body.id;

        await dbP.execute("DELETE FROM product_orders WHERE id = ?", [id]);

        res.send("Order deleted");
    });

router.get("/status", async (req, res) => {
    const [status] = await dbP.execute(
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
});

module.exports = router;
