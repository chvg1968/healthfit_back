import mongoose, { Schema } from "mongoose";

const daySchema = new Schema({
  date: String,
  eatenProducts: [
    { title: String, weight: Number, kcal: Number, id: String, _id: false },
  ],
  daySummary: { type: mongoose.Types.ObjectId, ref: "Summary" },
});

export default mongoose.model("Day", daySchema);
