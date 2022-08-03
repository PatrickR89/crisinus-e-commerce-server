const { messageSchema } = require("../utils/validationSchema");

const ExpressError = require("../utils/expressError");

module.exports.validateMessage = (req, res, next) => {
    const { error } = messageSchema.validate(req.body);

    if (error) {
        const msg = "message error";
        // res.json({ status: 400, message: msg });
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
