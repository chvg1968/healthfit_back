require("dotenv").config();

const { PORT = 9000, DB_HOST } = process.env;

module.exports = { PORT, DB_HOST };
