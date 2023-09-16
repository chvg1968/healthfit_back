const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  uid: mongoose.Types.ObjectId,
});

module.exports = mongoose.model("Session", sessionSchema);
