const express = require("express");

const router = express.Router();

const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");
const controller = require("../controllers/message_controllers");

router.route("/").get(verifyJWT, catchRequestError(controller.findAll));
router
    .route("/:id")
    .get(verifyJWT, catchRequestError(controller.findById))
    .put(verifyJWT, catchRequestError(controller.editById))
    .delete(verifyJWT, catchRequestError(controller.deleteById));

module.exports = router;
