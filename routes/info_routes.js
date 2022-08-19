const express = require("express");
const router = express.Router();

const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");
const controller = require("../controllers/info_controllers");

router.route("/").get(catchRequestError(controller.findAll));

router.post("/reset", verifyJWT, catchRequestError(controller.reset));

router
    .route("/:id")
    .post(verifyJWT, catchRequestError(controller.findById))
    .put(verifyJWT, catchRequestError(controller.editById));

module.exports = router;
