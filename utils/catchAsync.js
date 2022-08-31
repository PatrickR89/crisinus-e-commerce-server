const { logger } = require("../utils/winstonLogger");

const catchRequestError = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch((error) => {
      logger.error(error);
      res.status(500).send(new Error(error));
    });
  };
};

module.exports = { catchRequestError };
