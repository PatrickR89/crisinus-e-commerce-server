const express = require("express");

const { v4: uuidv4 } = require("uuid");

const { dbAuth } = require("../mySqlConnection");

const router = express.Router();

let dbP;

const connection = async () => {
  dbP = await dbAuth;
};

connection();

router.get("/getinfo", async (req, res) => {
  const [info] = await dbP.execute("SELECT * FROM info_pages");
  res.send(info);
});

router.post("/resetinfo", async (req, res) => {
  const [delItem] = await dbP.execute("TRUNCATE TABLE info_pages");
  console.log(delItem);
  const [insertItems] = await dbP.execute(
    `INSERT INTO info_pages (id, title, show_title, images, content) VALUES ('${uuidv4()}', 'about_us','About Us', '[]', '...'), ('${uuidv4()}', 'how_to_order','How to order', '[]', '...'), ('${uuidv4()}', 'general_information','General Information', '[]', '...'), ('${uuidv4()}', 'payment_methods','Payment Methods and Shipping', '[]', '...'), ('${uuidv4()}', 'disclaimer','Disclaimer', '[]', '...');`
  );
});

router.post("/getinfobyid", async (req, res) => {
  const id = req.body.id;
  const [pageById] = await dbP.execute(
    "SELECT * FROM info_pages WHERE id = ?",
    [id]
  );

  res.send(pageById);
});

router.put("/editinfo", async (req, res) => {
  const id = req.body.id;
  const images = req.body.images;
  const content = req.body.content;

  const [editPage] = await dbP.execute(
    "UPDATE info_pages SET images = ?, content = ? WHERE id = ?",
    [images, content, id]
  );

  res.send(editPage);
});

module.exports = router;
