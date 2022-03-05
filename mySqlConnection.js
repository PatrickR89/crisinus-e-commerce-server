const mysqlPromise = require("mysql2/promise");
const bluebird = require("bluebird");

module.exports.dbAuth = mysqlPromise.createConnection({
  user: process.env.MYSQL_USER,
  host: process.env.MYSQL_HOST,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  Promise: bluebird
});
