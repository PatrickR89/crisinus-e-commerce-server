const express = require("express");
const fetch = require("node-fetch");

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

router.get(
    "/currency",
    catchRequestError(async (req, res) => {
        const resp = await fetch("https://api.hnb.hr/tecajn/v1?valuta=EUR");
        const data = await resp.json();
        const currency = data[0]["Srednji za devize"];
        const value = Number(currency.replace(/,/g, "."));
        const valueJson = JSON.stringify(value);

        res.send(valueJson);
    })
);

module.exports = router;
