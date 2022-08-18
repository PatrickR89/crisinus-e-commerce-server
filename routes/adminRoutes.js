const express = require("express");

const router = express.Router();

const { catchRequestError } = require("../utils/catchAsync");
const { checkDB } = require("../mySqlConnection");
const { verifyJWT } = require("../JWT/jwtMiddleware");
const admin = require("../controllers/admin_controller");

router
    .route("/register")
    .get(verifyJWT, admin.getReg)
    .post(checkDB, admin.register);

router
    .route("/login")
    .get(admin.checkLogin)
    .post(checkDB, catchRequestError(admin.login));

router.get("/logout", admin.logout);

module.exports = router;
