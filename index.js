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

const mailchimp = require("@mailchimp/mailchimp_marketing");

const { dbAuth } = require("./mySqlConnection");
const { verifyJWT } = require("./JWT/jwtMiddleware");
const { logger } = require("./utils/winstonLogger");
const { catchRequestError } = require("./utils/catchAsync");

const bookRoutes = require("./routes/bookRoutes");
const authorRoutes = require("./routes/authorRoutes");
const giftshopRoutes = require("./routes/giftshopRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");
const newsRoutes = require("./routes/newsRoutes");
const infoRoutes = require("./routes/infoRoutes");
const publicRoutes = require("./routes/publicRoutes");
const linksRoutes = require("./routes/linksRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const sysRoutes = require("./routes/systemRoutes");

let dbP;

const connection = async () => {
    dbP = await dbAuth;
};

connection();

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

const allowlist = [
    "http://localhost:3000/",
    "http://localhost:3001/",
    "https://api.hnb.hr/tecajn/v1?valuta=EUR"
];

function corsOptionsDelegate(req, callback) {
    var corsOptions;
    if (allowlist.indexOf(req.header("Origin")) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    return callback(null, corsOptions);
}

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000/");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

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

mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX
});

app.use("/books", bookRoutes);
app.use("/authors", authorRoutes);
app.use("/giftshop", giftshopRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/news", newsRoutes);
app.use("/infopages", infoRoutes);
app.use("/links", linksRoutes);
app.use("/public", publicRoutes);
app.use("/orders", ordersRoutes);
app.use("/system", sysRoutes);

app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    bcrypt.hash(password, 10, async (err, hash) => {
        const [newUser] = await dbP.execute(
            "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
            [uuidv4(), username, hash],
            (err, result) => {
                if (err) return logger.error(err);
            }
        );
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
    logger.info(`User ${req.session.user} logged out`);
    req.session.destroy();
    res.end();
});

app.post(
    "/login",
    catchRequestError(async (req, res) => {
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
                        expiresIn: 1000 * 60 * 60 * 24
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
            logger.info(`user ${username} logged in`);
        } else {
            res.json({ auth: false, message: "No username/password match" });
            logger.info(`user ${username} failed to login`);
        }
    })
);

app.post(
    "/newsletter",
    catchRequestError(async (req, res) => {
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

            try {
                const response = await mailchimp.lists.addListMember(
                    process.env.MAILCHIMP_AUDIENCE_ID,
                    {
                        email_address: email,
                        status: "subscribed",
                        email_type: "html"
                    }
                );
                res.send(
                    `Thank you for your subscription on ${email}, ${response}`
                );
            } catch (err) {
                console.log(err);
                logger.error(`Mailchimp response fail: ${err}`);
                res.status(400).send(err);
            }
        }
    })
);

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

app.post(
    "/images/deleteimages",
    catchRequestError(async (req, res) => {
        const imgUrl = req.body.url;
        const newUrl = JSON.stringify(`./${imgUrl.replace(/\\/g, "/")}`);
        fse.remove(imgUrl, (err) => {
            if (err) return console.log(err);
            console.log(newUrl);
        });
        const [delImg] = await dbP.execute(
            "DELETE FROM images WHERE source = ?",
            [imgUrl]
        );
    })
);

app.get(
    "/images/getimages",
    catchRequestError(async (req, res) => {
        const [imageList] = await dbP.execute("SELECT * FROM images");
        res.send(imageList);
    })
);

app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong" } = err;

    res.status(status).render("error", { err });
    logger.error(`status: ${status}; message: ${message}`);
});

app.listen(3001, () => {
    console.log("app listening on port 3001");
    // logger.info("app listening on port 3001");
});
