const jwt = require("jsonwebtoken");

const { SECRET_KEY } = process.env;

const generateAccessToken = (userId) => {
  const payload = {
    userId,
    type: "access",
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: "30m" });
};

const generateRefreshToken = (userId) => {
  const payload = {
    userId,
    type: "refresh",
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: "30d" });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
