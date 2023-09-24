const { Schema, model } = require("mongoose");

const schemaProduct = Schema(
  {
    categories: {
      es: String,
    },
    weight: {
      type: Number,
      default: 100,
    },
    title: {
      es: String,
    },
    calories: {
      type: Number,
      default: 100,
    },
    groupBloodNotAllowed: {
      type: Array,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

const Product = model("product", schemaProduct);

module.exports = { Product };
