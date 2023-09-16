const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema({
  date: String,
  kcalLeft: Number,
  kcalConsumed: Number,
  percentsOfDailyRate: Number,
  dailyRate: Number,
  userId: mongoose.Types.ObjectId,
});

module.exports = mongoose.model("Summary", summarySchema);
