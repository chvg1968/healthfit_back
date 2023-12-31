const { Schema, model } = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const path = require("path");
const avatars = require("../public/defaultAvatars/avatars");

const userSchema = Schema(
  {
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    tokens: {
      accessToken: {
        type: String,
      },
      refreshToken: {
        type: String,
      },
      type: Object,
      default: null,
    },
    userInfo: {
      type: Object,
      default: null,
    },
    userDailyCalorieIntake: {
      type: Number,
      default: "",
    },
    userNotRecommendedProducts: {
      type: Array,
      default: [],
    },
    avatarURL: {
      type: String,
      default: () => {
        const avatarURL = path.join(
          "defaultAvatars",
          avatars[Math.floor(Math.random() * avatars.length)]
        );
        return avatarURL;
      },
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.methods.setPassword = function (password) {
  this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const joiUserInfoSchema = Joi.object({
  userData: Joi.object({
    height: Joi.string().required(),
    age: Joi.string().required(),
    currentWeight: Joi.string().required(),
    desiredWeight: Joi.string().required(),
    bloodType: Joi.string().required(),
  }),
});

const joiRegisterSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .max(100)
    .regex(/(?=.*[0-9])(?=.*[a-z])[0-9a-zA-Z]{8,}/)
    .required(),
  email: Joi.string()
    .min(3)
    .max(254)
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "ua"] },
    })
    .required(),
  name: Joi.string().min(3).max(254).required(),
});

const joiLoginSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "ua"] },
    })
    .required(),
});

const joiRefreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const User = model("user", userSchema);

module.exports = {
  User,
  joiRefreshTokenSchema,
  joiUserInfoSchema,
  joiRegisterSchema,
  joiLoginSchema,
};
