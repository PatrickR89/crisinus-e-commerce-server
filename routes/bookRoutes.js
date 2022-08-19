const express = require("express");

const { verifyJWT } = require("../JWT/jwtMiddleware");
const { catchRequestError } = require("../utils/catchAsync");
const book = require("../controllers/book_controller");

const router = express.Router();

router
    .route("/")
    .get(catchRequestError(book.findAll))
    .post(verifyJWT, catchRequestError(book.add));

router
    .route("/:id")
    .post(verifyJWT, catchRequestError(book.findByid))
    .put(verifyJWT, catchRequestError(book.editById))
    .delete(verifyJWT, catchRequestError(book.deleteById));

module.exports = router;
