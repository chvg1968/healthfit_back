const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  categories: Array,
  weight: Number,
  title: { ru: String, ua: String },
  calories: Number,
  groupBloodNotAllowed: {
    0: {},
    1: Boolean,
    2: Boolean,
    3: Boolean,
    4: Boolean,
  },
});

module.exports = mongoose.model("Product", productSchema);

