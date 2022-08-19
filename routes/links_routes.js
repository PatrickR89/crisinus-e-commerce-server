const express = require("express");
const router = express.Router();

const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");
const controller = require("../controllers/links_controllers");

router
    .route("/")
    .get(catchRequestError(controller.findAll))
    .post(verifyJWT, catchRequestError(controller.findById));
router.put("/:id", verifyJWT, catchRequestError(controller.editById));

module.exports = router;
