const express = require("express");
const router = express.Router();

const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");
const controller = require("../controllers/news_controllers");

router
    .route("/")
    .get(catchRequestError(controller.findAll))
    .post(verifyJWT, catchRequestError(controller.add));

router
    .route("/:id")
    .post(verifyJWT, catchRequestError(controller.findById))
    .put(verifyJWT, catchRequestError(controller.editById))
    .delete(verifyJWT, catchRequestError(controller.deleteById));

module.exports = router;
