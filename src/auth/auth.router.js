const { Router } = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
const tryCatchWrapper = require("../helpers/function-helpers/try-catch-wrapper");
const validate = require("../helpers/function-helpers/validate");
const {
  register,
  login,
  authorize,
  refreshTokens,
  logout,
} = require("./auth.controller");

const signUpSchema = Joi.object({
  username: Joi.string().min(3).max(254).required(),
  email: Joi.string().min(3).max(254).required(),
  password: Joi.string().min(8).max(100).required(),
});

const signInSchema = Joi.object({
  email: Joi.string().min(3).max(254).required(),
  password: Joi.string().min(8).max(100).required(),
});

const refreshTokensSchema = Joi.object({
  sid: Joi.string()
    .custom((value, helpers) => {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(value);
      if (!isValidObjectId) {
        return helpers.message({
          custom: "Invalid 'sid'. Must be MongoDB ObjectId",
        });
      }
      return value;
    })
    .required(),
});

const router = Router();

router.post("/register", validate(signUpSchema), tryCatchWrapper(register));
router.post("/login", validate(signInSchema), tryCatchWrapper(login));
router.post(
  "/refresh",
  validate(refreshTokensSchema),
  tryCatchWrapper(refreshTokens)
);
router.post("/logout", tryCatchWrapper(authorize), tryCatchWrapper(logout));

module.exports = router;
