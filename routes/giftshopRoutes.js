const express = require("express");

const { v4: uuidv4 } = require("uuid");

const { dbAuth } = require("../mySqlConnection");

const router = express.Router();

let dbP;

const connection = async () => {
  dbP = await dbAuth;
};

connection();

router.get("/giftlist", async (req, res) => {
  const [result] = await dbP.execute("SELECT * FROM giftshop");
  res.send(result);
});

router.post("/addgift", async (req, res) => {
  const name = req.body.name;
  const price = req.body.price;
  const max_order = req.body.max_order;
  const images = req.body.images;
  const description = req.body.description;

  const [addedItem] = await dbP.execute(
    "INSERT INTO giftshop (id, name, price, max_order, images, description) VALUES (?, ?, ?, ?, ?, ?)",
    [uuidv4(), name, price, max_order, images, description]
  );
  res.send(addedItem);
});

router.post("/getitem", async (req, res) => {
  const id = req.body.id;
  const [item] = await dbP.execute("SELECT * FROM giftshop WHERE id = ?", [id]);
  res.send(item);
});

router.put("/editgift", async (req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const price = req.body.price;
  const max_order = req.body.max_order;
  const images = req.body.images;
  const description = req.body.description;

  const tempImgs = JSON.stringify(images);

  const [editedItem] = await dbP.execute(
    "UPDATE giftshop SET name = ?, price =?, max_order =?, images =?, description =? WHERE id =?",
    [name, price, max_order, tempImgs, description, id]
  );

  res.send(editedItem);
});

router.delete("/deleteitem", async (req, res) => {
  const id = req.body.id;
  const [delItem] = await dbP.execute("DELETE FROM giftshop WHERE id = ?", [
    id
  ]);

  res.send(delItem);
});

module.exports = router;
