import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  name: String,
  email: String,
  passwordHash: String,
  userData: { type: Object, default: {} },
  days: [{ type: mongoose.Types.ObjectId, ref: "Day" }],
});

export default mongoose.model("User", userSchema);
