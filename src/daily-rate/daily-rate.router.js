const { Router } = require("express");
const Joi = require("joi");
const mongoose = require("mongoose");
const { BloodType } = require("../helpers/typescript-helpers/enums");
const validate = require("../helpers/function-helpers/validate");
const { authorize } = require("../auth/auth.controller");
const tryCatchWrapper = require("../helpers/function-helpers/try-catch-wrapper");
const { countDailyRate } = require("./daily-rate.controller");

const getDailyRateSchema = Joi.object({
  weight: Joi.number().required().min(20).max(500),
  height: Joi.number().required().min(100).max(250),
  age: Joi.number().required().min(18).max(100),
  desiredWeight: Joi.number().required().min(20).max(500),
  bloodType: Joi.number()
    .required()
    .valid(
      BloodType.ONE,
      BloodType.TWO,
      BloodType.THREE,
      BloodType.FOUR
    ),
});

const userIdSchema = Joi.object({
  userId: Joi.string()
    .custom((value, helpers) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      if (!isValidObjectId) {
        return helpers.message({
          custom: "Invalid 'userId'. Must be MongoDB object id",
        });
      }
      return value;
    })
    .required(),
});

const router = Router();

router.post("/", validate(getDailyRateSchema), tryCatchWrapper(countDailyRate));
router.post(
  "/:userId",
  tryCatchWrapper(authorize),
  validate(userIdSchema, "params"),
  validate(getDailyRateSchema),
  tryCatchWrapper(countDailyRate)
);

module.exports = router;
