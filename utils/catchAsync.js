const { logger } = require("../utils/winstonLogger");

const catchRequestError = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch((next) => {
            logger.error(next);
            console.log(next);
        });
    };
};

module.exports = { catchRequestError };
