const mongoose = require("mongoose");
const app = require("./app");
const { PORT, DB_HOST } = require("./helpers/env");
mongoose.set('strictQuery', true);

mongoose
  .connect(DB_HOST, { dbName: 'db-health' }) // Especifica la base de datos aquí
  .then(() => {
    console.log("Database connection successful");
  })
  .then(() => {
    app.listen(PORT);
    console.log(`Server running. Use our API on port: ${PORT}`);
  })
  .catch((error) => {
    console.log(`ERROR: ${error.message}`);
    process.exit(1);
  });


