const { dbAuth } = require("./mySqlConnection");
const { logger } = require("../utils/winstonLogger");

module.exports = function initializeDatabase() {
  dbAuth.connect();
  dbAuth.query("SHOW TABLES", (error, response) => {
    let tables = [];
    const requiredTables = [
      "anchor_links",
      "authors",
      "books",
      "contact_messages",
      "giftshop",
      "images",
      "info_pages",
      "news",
      "newsletter",
      "product_dimensions",
      "product_orders",
      "ratings",
      "users"
    ];
    response.forEach((singleElement) => {
      tables.push(singleElement.Tables_in_crisinushr_main_schema);
    });

    requiredTables.forEach((table) => {
      if (!tables.includes(table)) {
        createTable(table);
      }
    });

    dbAuth.end();
    // console.log(`after end connection ${dbAuth._closing}`);
    if (error) {
      logger.error(`Database check issue: ${error}`);
    }
  });
};

function createTable(table) {
  if (table === "product_dimensions") {
    dbAuth.query(
      `CREATE TABLE product-dimensions(
      product_id VARCHAR(100) PRIMARY KEY,
      width INT,
      height INT,
      depth INT,
      weight INT)`,
      (error, response) => {
        if (error) {
          logger.error(`${table} table creation error: ${error}`);
        }
      }
    );
  }
  if (table === "anchor_links") {
    dbAuth.query(
      `CREATE TABLE anchor_links(
      id VARCHAR(50) PRIMARY KEY, 
      link VARCHAR(150))  `,
      (error, response) => {
        if (error) {
          logger.error(`${table} table creation error: ${error}`);
        }
      }
    );
  }

  if (table === "authors") {
    dbAuth.query(
      `CREATE TABLE authors( 
      id VARCHAR(50) PRIMARY KEY, 
      name VARCHAR(100), 
      last_name VARCHAR(100), 
      url VARCHAR(200), 
      img JSON, 
      bio TEXT)  `,
      (error, response) => {
        if (error) {
          logger.error(`${table} table creation error: ${error}`);
        }
      }
    );
  }

  if (table === "books") {
    dbAuth.query(
      `CREATE TABLE books(
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(200),
      authors JSON,
      images JSON,
      genre VARCHAR(200),
      max_order INT, 
      price INT, 
      publisher VARCHAR(200), 
      language VARCHAR(45),  
      year INT, 
      description TEXT)  `,
      (error, response) => {
        if (error) {
          logger.error(`${table} table creation error: ${error}`);
        }
      }
    );
  }

  if (table === "contact_messages") {
    dbAuth.query(
      `CREATE TABLE contact_messages(
      id INT AUTO_INCREMENT PRIMARY KEY, 
      name VARCHAR(100), 
      email VARCHAR(100), 
      message TEXT, 
      date VARCHAR(50), 
      status ENUM('NEW','CHECKED','CONFIRMED'))  `,
      (error, response) => {
        if (error) {
          logger.error(`${table} table creation error: ${error}`);
        }
      }
    );
  }

  if (table === "giftshop") {
    dbAuth.query(
      `CREATE TABLE giftshop(
      id VARCHAR(50) PRIMARY KEY, 
      name VARCHAR(100), 
      price INT, 
      max_order INT,
      images JSON,
      description TEXT)  `,
      (error, response) => {
        if (error) {
          logger.error(`${table} table creation error: ${error}`);
        }
      }
    );
  }

  if (table === "images") {
    dbAuth.query(
      `CREATE TABLE images(
      id VARCHAR(100) PRIMARY KEY,
      name VARCHAR(100),
      source VARCHAR(200))  `,
      (error, response) => {
        if (error) {
          logger.error(`${table} table creation error: ${error}`);
        }
      }
    );
  }

  if (table === "info_pages") {
    dbAuth.query(
      `CREATE TABLE info_pages(
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(100) ,
      show_title VARCHAR(100),
      images JSON,
      content TEXT)  `,
      (error, response) => {
        if (error) {
          logger.error(`${table} table creation error: ${error}`);
        }
      }
    );
  }

  if (table === "news") {
    dbAuth.query(
      `CREATE TABLE news(
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(150),
      text TEXT,
      images JSON,
      date DATE)  `,
      (error, response) => {
        if (error) {
          logger.error(`${table} table creation error: ${error}`);
        }
      }
    );
  }

  if (table === "newsletter") {
    dbAuth.query(
      `CREATE TABLE newsletter(
      id INT AUTO_INCREMENT PRIMARY KEY,
       email VARCHAR(100))  `,
      (error, response) => {
        if (error) {
          logger.error(`${table} table creation error: ${error}`);
        }
      }
    );
  }

  if (table === "product_orders") {
    dbAuth.query(
      `CREATE TABLE product_orders(
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_order TEXT,
      order_date VARCHAR(50),
      order_status ENUM('NEW ORDER','CHECKED','CONFIRMED'))  `,
      (error, response) => {
        if (error) {
          logger.error(`${table} table creation error: ${error}`);
        }
      }
    );
  }

  if (table === "ratings") {
    dbAuth.query(
      `CREATE TABLE ratings(
      id VARCHAR(50) PRIMARY KEY,
      book_id VARCHAR(50),
      book_title VARCHAR(45),
      rating_title VARCHAR(150),
      rating INT,
      reviewer VARCHAR(100),
      review TEXT)  `,
      (error, response) => {
        if (error) {
          logger.error(`${table} table creation error: ${error}`);
        }
      }
    );
  }

  if (table === "users") {
    dbAuth.query(
      `CREATE TABLE users(
      id VARCHAR(50) PRIMARY KEY,
      username VARCHAR(100),
      password VARCHAR(150))  `,
      (error, response) => {
        if (error) {
          logger.error(`${table} table creation error: ${error}`);
        }
      }
    );
  }
}
