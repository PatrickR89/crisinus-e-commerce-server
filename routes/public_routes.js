const express = require("express");
const router = express.Router();

const { catchRequestError } = require("../utils/catchAsync");
const { validateMessage } = require("../utils/middleware");
const public = require("../controllers/public_controllers");

router.post("/submitcart", catchRequestError(public.submitCart));

router.post(
  "/submitmessage",
  validateMessage,
  catchRequestError(public.submitMessage)
);

router
  .route("/books")
  .get(catchRequestError(public.books))
  .post(catchRequestError(public.bookById));

router
  .route("/gifts")
  .get(catchRequestError(public.gifts))
  .post(catchRequestError(public.giftById));

router
  .route("/news")
  .get(catchRequestError(public.news))
  .post(catchRequestError(public.newsById));

router.post("/informations", catchRequestError(public.info));

router.get("/reviews", catchRequestError(public.reviews));

router
  .route("/authors")
  .get(catchRequestError(public.authors))
  .post(catchRequestError(public.authorById));

router.route("/links").get(catchRequestError(public.links));
router.route("/dimensions").post(catchRequestError(public.dimensions));

module.exports = router;
