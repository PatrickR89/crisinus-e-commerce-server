const winston = require("winston");

const messageFormat = winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}]${level}: ${message}`;
});

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({
            format: "DD-MM-YYYY HH:mm:ss"
        }),
        messageFormat
    ),
    transports: [
        new winston.transports.File({
            filename: "application.log",
            handleExceptions: true,
            handleRejections: true
        })
    ]
});

const clientLogger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({
            format: "DD-MM-YYYY HH:mm:ss"
        }),
        messageFormat
    ),
    transports: [
        new winston.transports.File({
            filename: "clientApp.log",
            handleExceptions: true,
            handleRejections: true
        })
    ]
});

module.exports = { logger, clientLogger };
