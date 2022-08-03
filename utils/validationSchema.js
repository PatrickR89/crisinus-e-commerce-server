const BaseJoi = require("joi");
const sanitizeHTML = require("sanitize-html");

const extension = (joi) => ({
    type: "string",
    base: joi.string(),
    messages: {
        "string.escapeHTML": "{{#label}} must not include HTML"
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAtributes: {}
                });
                if (clean !== value) {
                    return helpers.error("string.escapeHTML", { value });
                }
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.messageSchema = Joi.object({
    contactForm: Joi.object({
        contactName: Joi.string().required().escapeHTML(),
        contactEmail: Joi.string().required().escapeHTML(),
        contactMessage: Joi.string().required().escapeHTML()
    }).required()
});
