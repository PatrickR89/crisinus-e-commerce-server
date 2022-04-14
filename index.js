if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { v4: uuidv4 } = require("uuid");

const express = require("express");
const cors = require("cors");
const fse = require("fs-extra");
const multer = require("multer");

const { dbAuth } = require("./mySqlConnection");

const bookRoutes = require("./routes/bookRoutes");
const authorRoutes = require("./routes/authorRoutes");
const giftshopRoutes = require("./routes/giftshopRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");
const newsRoutes = require("./routes/newsRoutes");
const infoRoutes = require("./routes/infoRoutes");

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "uploads");
  },
  filename: (req, file, callBack) => {
    callBack(null, `${uuidv4()}-${file.originalname}`);
  }
});

// image url -> req.file.path

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  }
});

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

let dbP;

const connection = async () => {
  dbP = await dbAuth;
};

connection();

app.use("/books", bookRoutes);
app.use("/authors", authorRoutes);
app.use("/giftshop", giftshopRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/news", newsRoutes);
app.use("/infopages", infoRoutes);

app.post("/images/addimages", upload.array("images", 5), (req, res) => {
  const fileList = req.files;
  res.send(fileList);
});

app.post("/images/deleteimages", (req, res) => {
  const imgUrl = req.body.url;
  const newUrl = JSON.stringify(`./${imgUrl.replace(/\\/g, "/")}`);
  fse.remove(imgUrl, (err) => {
    if (err) return console.log(err);
    console.log(newUrl);
  });
});

app.listen(3001, () => {
  console.log("app listening on port 3001");
});
