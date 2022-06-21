if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const { v4: uuidv4 } = require("uuid");

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const fse = require("fs-extra");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const { dbAuth } = require("./mySqlConnection");

const { verifyJWT } = require("./JWT/jwtMiddleware");

const bookRoutes = require("./routes/bookRoutes");
const authorRoutes = require("./routes/authorRoutes");
const giftshopRoutes = require("./routes/giftshopRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");
const newsRoutes = require("./routes/newsRoutes");
const infoRoutes = require("./routes/infoRoutes");
const publicRoutes = require("./routes/publicRoutes");

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

const app = express();

const allowlist = ["http://localhost:3000", "http://localhost:3001"];

var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (allowlist.includes(req.header("Origin"))) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
    session({
        key: process.env.COOKIE_KEY,
        secret: process.env.COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 1000 * 60 * 60 * 24 * 3
        }
    })
);

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
app.use("/public", publicRoutes);

app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    bcrypt.hash(password, 10, async (err, hash) => {
        const [newUser] = await dbP.execute(
            "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
            [uuidv4(), username, hash],
            (err, result) => {
                if (err) return console.log(err);
            }
        );
        console.log(newUser);
    });
});

app.get("/authentication", verifyJWT, (req, res) => {
    console.log(req.body);
    const token = req.headers["x-access-token"];
    console.log(token);
    res.send("Authenticated!");
});

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get("/logout", (req, res) => {
    res.clearCookie("access-token");
    res.clearCookie("id");
    res.end();
});

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const [user] = await dbP.execute(
        "SELECT * FROM users WHERE username =?",
        [username],
        (err, result) => {
            if (err) return console.log(err);
        }
    );
    if (user.length > 0) {
        bcrypt.compare(password, user[0].password, (err, response) => {
            if (response) {
                req.session.user = user;
                const id = user[0].id;
                const token = jwt.sign({ id }, process.env.JWT_SECRET, {
                    expiresIn: 600
                });

                res.cookie("access-token", token, {
                    maxAge: 1000 * 60 * 60 * 24,
                    httpOnly: true
                });
                res.json({ auth: true, token: token, result: user });
            } else {
                res.json({
                    auth: false,
                    message: "No username/password match"
                });
            }
        });
    } else {
        res.json({ auth: false, message: "No username/password match" });
    }
});

app.post("/newsletter", async (req, res) => {
    const email = req.body.email;

    const [checkEmail] = await dbP.execute(
        "SELECT * FROM newsletter WHERE email = ?",
        [email]
    );

    if (checkEmail[0]) {
        res.send("You have already subscribed to our newsletter!");
    } else {
        const [saveEmail] = await dbP.execute(
            "INSERT INTO newsletter (email) VALUES (?)",
            [email]
        );
        res.send(`Thank you for your subscription on ${saveEmail[0]}`);
    }
});

app.post("/images/addimages", upload.array("images", 5), (req, res) => {
    const fileList = req.files;
    res.send(fileList);
    fileList.forEach(async (file) => {
        const [saveImage] = await dbP.execute(
            "INSERT INTO images (id, name, source) VALUES (?, ?, ?)",
            [file.filename, file.originalname, file.path]
        );
    });
});

app.post("/images/deleteimages", async (req, res) => {
    const imgUrl = req.body.url;
    const newUrl = JSON.stringify(`./${imgUrl.replace(/\\/g, "/")}`);
    fse.remove(imgUrl, (err) => {
        if (err) return console.log(err);
        console.log(newUrl);
    });
    const [delImg] = await dbP.execute("DELETE FROM images WHERE source = ?", [
        imgUrl
    ]);
});

app.get("/images/getimages", async (req, res) => {
    const [imageList] = await dbP.execute("SELECT * FROM images");
    console.log(imageList);
    res.send(imageList);
});

app.listen(3001, () => {
    console.log("app listening on port 3001");
});
