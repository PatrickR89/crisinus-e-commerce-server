const express = require("express");

const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");
const author = require("../controllers/author_controllers");

const router = express.Router();

router.route("/").get(catchRequestError(author.findAll));
router
    .route("/:id")
    .post(verifyJWT, catchRequestError(author.findById))
    .put(verifyJWT, catchRequestError(author.editById))
    .delete(verifyJWT, catchRequestError(author.deleteById));

module.exports = router;
