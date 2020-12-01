import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: String,
    passwordHash: String,
    userData: { type: Object, default: {} },
    days: [{ type: mongoose.Types.ObjectId, ref: "Day" }],
  },
  { minimize: false }
);

export default mongoose.model("User", userSchema);
