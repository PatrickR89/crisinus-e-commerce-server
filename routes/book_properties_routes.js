const express = require("express");
const router = express.Router();

const { catchRequestError } = require("../utils/catchAsync");
const { verifyJWT } = require("../JWT/jwtMiddleware");
const controller = require("../controllers/book_properties_controllers");

router.route("/").post(verifyJWT, catchRequestError(controller.add));
router
  .route("/:id")
  .post(catchRequestError(controller.findById))
  .put(verifyJWT, catchRequestError(controller.editById))
  .delete(verifyJWT, catchRequestError(controller.deleteById));

module.exports = router;
