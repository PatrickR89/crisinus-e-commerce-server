const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const { catchRequestError } = require("../utils/catchAsync");
const controller = require("../controllers/image_controllers");

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

router.post("/addimages", upload.array("images", 5), controller.add);

router.post("/deleteimages", catchRequestError(controller.delete));

router.get("/getimages", catchRequestError(controller.loadList));

module.exports = router;
