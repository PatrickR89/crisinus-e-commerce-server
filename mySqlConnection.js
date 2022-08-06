const mysqlPromise = require("mysql2/promise");
const mysql = require("mysql2");
const bluebird = require("bluebird");

module.exports.dbAuth = mysqlPromise.createConnection({
    user: process.env.MYSQL_USER,
    host: process.env.MYSQL_HOST,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    Promise: bluebird
});

const dbPool = mysql.createPool({
    user: process.env.MYSQL_USER,
    host: process.env.MYSQL_HOST,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0
});

module.exports.dbPoolPromise = dbPool.promise();
