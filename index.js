const mongoose = require("mongoose")
const app = require("./app");
const { PORT, DB_HOST } = require("./helpers/env");
mongoose.set("strictQuery", true);
const { MongoClient } = require("mongodb");



async function checkMongoDBConnection() {
   // Reemplaza con tu URI de conexión
  const client = new MongoClient(DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log("Connection to MongoDB sucessfull!");
    app.listen(PORT);
    console.log(`Server running. Use our API on port: ${PORT}`);

    // Test connection to products collection
    const database = client.db("db-health");
    const collectionProducts = database.collection("products");
    const collectionUsers = database.collection("users");
    const count1 = await collectionProducts.countDocuments();
    const count2 = await collectionUsers.countDocuments();
    console.log(`Number of elements from collection "Users": ${count2}`);
    console.log(`Number of elements from collection "products": ${count1}`);
  } finally {
    await client.close();
  }
}

// Llamada a la función
checkMongoDBConnection();



