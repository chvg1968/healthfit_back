const mongoose = require("mongoose");

const daySchema = new mongoose.Schema({
  date: String,
  eatenProducts: [
    { title: String, weight: Number, kcal: Number, id: String, _id: false },
  ],
  daySummary: { type: mongoose.Types.ObjectId, ref: "Summary" },
});

module.exports = mongoose.model("Day", daySchema);

