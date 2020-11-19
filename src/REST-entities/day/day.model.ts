import mongoose, { Schema } from "mongoose";

const daySchema = new Schema({
  date: String,
  eatenProducts: { type: Object, default: {} },
  daySummary: { type: mongoose.Types.ObjectId, ref: "Summary" },
});

export default mongoose.model("Day", daySchema);
