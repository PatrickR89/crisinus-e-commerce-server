const express = require("express");

const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");
const controller = require("../controllers/info_controllers");
const router = express.Router();

router.route("/").get(catchRequestError(controller.findAll));

router.post("/reset", verifyJWT, catchRequestError(controller.reset));

router
    .route("/:id")
    .post(verifyJWT, catchRequestError(controller.findById))
    .put(verifyJWT, catchRequestError(controller.editById));

module.exports = router;
