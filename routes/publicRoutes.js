const express = require("express");
const { dbAuth } = require("../mySqlConnection");
const router = express.Router();

let dbP;

const connection = async () => {
  dbP = await dbAuth;
};

connection();

router.post("/submitcart", (req, res) => {
  console.log(req.body);
  res.send("Order submitted");
});

router.post("/submitmessage", (req, res) => {
  console.log(req.body);
  res.send("Message sent");
});

module.exports = router;
