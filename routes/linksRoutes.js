const express = require("express");

const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");
const controller = require("../controllers/links_controllers");

const router = express.Router();

router
    .route("/")
    .get(catchRequestError(controller.findAll))
    .post(verifyJWT, catchRequestError(controller.findById));
router.put("/:id", verifyJWT, catchRequestError(controller.editById));

module.exports = router;
