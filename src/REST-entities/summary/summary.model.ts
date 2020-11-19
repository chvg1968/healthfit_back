import mongoose, { Schema } from "mongoose";

const summarySchema = new Schema({
  date: String,
  kcalLeft: Number,
  kcalConsumed: Number,
  percentsOfDailyRate: Number,
  dailyRate: Number,
});

export default mongoose.model("Summary", summarySchema);
