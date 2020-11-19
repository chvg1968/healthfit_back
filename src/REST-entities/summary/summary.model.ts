import mongoose, { Schema } from "mongoose";

const summarySchema = new Schema({
  date: String,
  kcalLeft: Number,
  kcalConsumed: Number,
  percentsOfDailyRate: Number,
  dailyRate: Number,
  userId: mongoose.Types.ObjectId,
});

export default mongoose.model("Summary", summarySchema);
