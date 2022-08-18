const express = require("express");
const fse = require("fs-extra");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const { catchRequestError } = require("../utils/catchAsync");
const { dbPoolPromise, checkDB } = require("../mySqlConnection");

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, "uploads");
    },
    filename: (req, file, callBack) => {
        callBack(null, `${uuidv4()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
});

router.post("/addimages", upload.array("images", 5), (req, res) => {
    const fileList = req.files;
    res.send(fileList);
    fileList.forEach(async (file) => {
        const [saveImage] = await dbPoolPromise.execute(
            "INSERT INTO images (id, name, source) VALUES (?, ?, ?)",
            [file.filename, file.originalname, file.path]
        );
    });
});

router.post(
    "/deleteimages",
    catchRequestError(async (req, res) => {
        const imgUrl = req.body.url;
        const newUrl = JSON.stringify(`./${imgUrl.replace(/\\/g, "/")}`);
        fse.remove(imgUrl, (err) => {
            if (err) return console.log(err);
        });
        const [delImg] = await dbPoolPromise.execute(
            "DELETE FROM images WHERE source = ?",
            [imgUrl]
        );
    })
);

router.get(
    "/getimages",
    catchRequestError(async (req, res) => {
        const [imageList] = await dbPoolPromise.execute("SELECT * FROM images");
        res.send(imageList);
    })
);

module.exports = router;
