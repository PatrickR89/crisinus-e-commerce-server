const express = require("express");

const { catchRequestError } = require("../utils/catchAsync");
const { clientLogger } = require("../utils/winstonLogger");
const router = express.Router();

router.post(
    "/error",
    catchRequestError(async (req, res) => {
        const err = req.body.err;
        clientLogger.error(err);
    })
);
router.post(
    "/info",
    catchRequestError(async (req, res) => {
        const info = req.body.info;
        clientLogger.info(info);
    })
);

module.exports = router;
