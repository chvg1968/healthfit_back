const { Router } = require("express");
const Joi = require("joi");
const tryCatchWrapper = require("../helpers/function-helpers/try-catch-wrapper");
const validate = require("../helpers/function-helpers/validate");
const { authorize } = require("../auth/auth.controller");
const { checkDailyRate } = require("../REST-entities/day/day.controller");
const { findProducts } = require("./product-search.controller");

const searchQuerySchema = Joi.object({
  search: Joi.string().min(1).max(30).required(),
});

const router = Router();

router.get(
  "/",
  tryCatchWrapper(authorize),
  tryCatchWrapper(checkDailyRate),
  validate(searchQuerySchema, "query"),
  tryCatchWrapper(findProducts)
);

module.exports = router;
