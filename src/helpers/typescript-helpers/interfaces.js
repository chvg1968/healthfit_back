const { Schema, model } = require("mongoose");

const momSchema = new Schema({
  username: String,
  email: String,
  passwordHash: String,
  userData: {
    weight: Number,
    height: Number,
    age: Number,
    bloodType: Number,
    desiredWeight: Number,
    dailyRate: Number,
    notAllowedProducts: [String],
  },
  days: [{ type: Schema.Types.ObjectId, ref: "Day" }],
});

const momPopulatedSchema = new Schema({
  username: String,
  email: String,
  passwordHash: String,
  userData: {
    weight: Number,
    height: Number,
    age: Number,
    bloodType: Number,
    desiredWeight: Number,
    dailyRate: Number,
    notAllowedProducts: [String],
  },
  days: [{ type: Schema.Types.ObjectId, ref: "Day" }],
});

const daySchema = new Schema({
  date: String,
  eatenProducts: [
    {
      title: String,
      weight: Number,
      kcal: Number,
      id: String,
    },
  ],
  daySummary: { type: Schema.Types.ObjectId, ref: "DaySummary" },
});

const dayPopulatedSchema = new Schema({
  date: String,
  eatenProducts: [
    {
      title: String,
      weight: Number,
      kcal: Number,
      id: String,
    },
  ],
  daySummary: { type: Schema.Types.ObjectId, ref: "DaySummary" },
});

const daySummarySchema = new Schema({
  date: String,
  kcalLeft: Number,
  kcalConsumed: Number,
  dailyRate: Number,
  percentsOfDailyRate: Number,
  userId: { type: Schema.Types.ObjectId, ref: "Mom" },
});

const sessionSchema = new Schema({
  uid: String,
});

const productSchema = new Schema({
  title: { ru: String, ua: String },
  weight: Number,
  calories: Number,
  categories: [String],
  groupBloodNotAllowed: [Boolean],
});

module.exports = {
  Mom: model("Mom", momSchema),
  MomPopulated: model("MomPopulated", momPopulatedSchema),
  Day: model("Day", daySchema),
  DayPopulated: model("DayPopulated", dayPopulatedSchema),
  DaySummary: model("DaySummary", daySummarySchema),
  Session: model("Session", sessionSchema),
  Product: model("Product", productSchema),
};
