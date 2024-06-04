const { Schema, model } = require("mongoose");

const schemaProduct = Schema(
  {
    categories: {
      en: String,
    },
    weight: {
      type: Number,
      default: 100,
    },
    title: {
      type:{
      en:String,
      es:String,
      },
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
