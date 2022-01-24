if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  user: process.env.MYSQL_USER,
  host: process.env.MYSQL_HOST,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

app.listen(3001, () => {
  console.log("app listening on port 3001");
});
