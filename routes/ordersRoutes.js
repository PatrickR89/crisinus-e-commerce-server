const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");
const controller = require("../controllers/orders_controllers");

router.route("/").get(verifyJWT, catchRequestError(controller.findAll));
router
    .route("/:id")
    .post(verifyJWT, catchRequestError(controller.findById))
    .put(verifyJWT, catchRequestError(controller.editById))
    .delete(verifyJWT, catchRequestError(controller.deleteById));

router.get("/status", catchRequestError(controller.status));

module.exports = router;
