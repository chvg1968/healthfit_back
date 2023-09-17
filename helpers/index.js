const createError = require("./createError");
const { sendEmail, msg } = require("./sendEmail");
const calculateCalories = require("./calculateCalories");

module.exports = {
  createError,
  sendEmail,
  msg,
  calculateCalories,
};
