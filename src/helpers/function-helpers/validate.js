const { ObjectSchema } = require("joi");
const { ReqBodyParts } = require("../typescript-helpers/enums");

module.exports = function (schema, reqPart = "body") {
  return function (req, res, next) {
    const validationResult = schema.validate(req[reqPart]);
    if (validationResult.error) {
      return res.status(400).send({ message: validationResult.error.message });
    }
    next();
  };
};

