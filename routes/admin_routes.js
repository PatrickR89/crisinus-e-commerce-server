const express = require("express");
const router = express.Router();

const { catchRequestError } = require("../utils/catchAsync");
const { checkDB } = require("../mySqlConnection");
const { verifyJWT } = require("../JWT/jwtMiddleware");
const controller = require("../controllers/admin_controllers");

router
    .route("/register")
    .get(verifyJWT, controller.getReg)
    .post(checkDB, controller.register);

router
    .route("/login")
    .get(controller.checkLogin)
    .post(checkDB, catchRequestError(controller.login));

router.get("/logout", controller.logout);

module.exports = router;
