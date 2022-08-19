const express = require("express");
const router = express.Router();

const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");
const controller = require("../controllers/author_controllers");

router.route("/").get(catchRequestError(controller.findAll));
router
    .route("/:id")
    .post(verifyJWT, catchRequestError(controller.findById))
    .put(verifyJWT, catchRequestError(controller.editById))
    .delete(verifyJWT, catchRequestError(controller.deleteById));

module.exports = router;
