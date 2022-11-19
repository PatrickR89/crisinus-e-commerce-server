const mysqlPromise = require("mysql2/promise");
const mysql = require("mysql2");
const bluebird = require("bluebird");

const { logger } = require("../utils/winstonLogger");

const poolConnectConfig = {
  user: process.env.MYSQL_USER,
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 500,
  queueLimit: 0,
  enableKeepAlive: true
};

const singleConnectConfig = {
  user: process.env.MYSQL_USER,
  host: process.env.MYSQL_HOST,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  Promise: bluebird
};

var connection = mysql.createPool(poolConnectConfig);

handleDisconnect();

let dbPoolPromise = connection.promise();

// const dbAuth = createSingleConnection();

function createSingleConnection() {
  return mysql.createConnection(singleConnectConfig);
}

const checkDB = (req, res, next) => {
  // const path = req._parsedOriginalUrl.pathname;
  try {
    handleDisconnect();
    next();
  } catch (error) {
    logger.error(`Database check issue: ${error}`);
  }
};

function restartConnection() {
  connection = mysql.createPool(poolConnectConfig);
  dbPoolPromise = connection.promise();
}

function handleDisconnect() {
  if (!connection || connection === undefined) {
    connection = mysql.createPool(poolConnectConfig);
  }

  connection.getConnection((err, conn) => {
    if (err) {
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        logger.error("Database connection was closed.");
      }
      if (err.code === "ER_CON_COUNT_ERROR") {
        logger.error("Database has too many connections.");
      }
      if (err.code === "ECONNREFUSED") {
        logger.error("Database connection was refused.");
      }
      if (err) {
        logger.error(err);
      }
      connection.end();
      setTimeout(restartConnection(), 2000);
    }

    if (conn) return conn.release();
    return;
  });
}

module.exports = {
  dbPoolPromise,
  checkDB,
  createSingleConnection
};
