const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
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
    days: [{ type: mongoose.Types.ObjectId, ref: "Day" }],
  },
  { minimize: false }
);

module.exports = mongoose.model("User", userSchema);

