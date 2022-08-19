const express = require("express");
const router = express.Router();

const { catchRequestError } = require("../utils/catchAsync");
const { verifyClient } = require("../JWT/jwtMiddleware");
const controller = require("../controllers/system_controller");

router.post("/error", catchRequestError(controller.error));

router.post("/info", catchRequestError(controller.info));

router.get("/currency", catchRequestError(controller.getCurrency));

router.get("/cookiesmodal", controller.checkCookies);

router.get("/cookiesconfirm", controller.confirmCookies);

router.post("/client", controller.setClient);

router.post(
    "/newsletter",
    verifyClient,
    catchRequestError(controller.assignNewsletter)
);

module.exports = router;
