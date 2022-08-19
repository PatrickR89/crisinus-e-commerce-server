if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const { checkDB } = require("./mySqlConnection");
const { verifyClient } = require("./JWT/jwtMiddleware");
const { logger } = require("./utils/winstonLogger");

const {
    adminRoutes,
    authorRoutes,
    bookRoutes,
    giftshopRoutes,
    imageRoutes,
    infoRoutes,
    linksRoutes,
    messagesRoutes,
    newsRoutes,
    ordersRoutes,
    publicRoutes,
    reviewsRoutes,
    sysRoutes
} = require("./routes");

const port = process.env.PORT || 3001;

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
app.use(express.static(path.resolve(__dirname, "./client")));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(
    session({
        key: process.env.COOKIE_KEY,
        secret: process.env.COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
            maxAge: 1000 * 60 * 60 * 24 * 3
        }
    })
);

app.use("/api/books", checkDB, verifyClient, bookRoutes);
app.use("/api/authors", checkDB, verifyClient, authorRoutes);
app.use("/api/giftshop", checkDB, verifyClient, giftshopRoutes);
app.use("/api/reviews", checkDB, verifyClient, reviewsRoutes);
app.use("/api/news", checkDB, verifyClient, newsRoutes);
app.use("/api/infopages", checkDB, verifyClient, infoRoutes);
app.use("/api/links", checkDB, verifyClient, linksRoutes);
app.use("/api/public", checkDB, verifyClient, publicRoutes);
app.use("/api/orders", checkDB, verifyClient, ordersRoutes);
app.use("/api/system", checkDB, sysRoutes);
app.use("/api/messages", checkDB, verifyClient, messagesRoutes);
app.use("/api/admin", verifyClient, adminRoutes);
app.use("/api/images", checkDB, verifyClient, imageRoutes);

app.get("*", checkDB, (req, res) => {
    res.sendFile(path.resolve(__dirname, "./client", "index.html"));
});

app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong" } = err;

    logger.error(`status: ${status}; message: ${message}`);
    res.status(status).send(err);
});

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
    // logger.info("app listening on port 3001");
});
