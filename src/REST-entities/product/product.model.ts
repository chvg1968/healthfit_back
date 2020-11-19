import { number } from "joi";
import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
  categories: Array,
  weight: Number,
  title: Object,
  calories: Number,
  groupBloodNotAllowed: Object,
});

export default mongoose.model("Product", productSchema);
