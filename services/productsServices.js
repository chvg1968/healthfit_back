const { MongoClient } = require('mongodb');
const { DB_HOST } = process.env;
const dbName = 'db-health'; // Nombre de la base de datos



const listProducts = async (lang = 'es') => {
  const client = new MongoClient(DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true });// Define el nombre de la colección según el idioma seleccionado
  const collectionName = lang === 'en' ? 'productsen' : 'products';

  try {
    // Obtiene la colección utilizando el cliente de MongoDB
    const collection = client.db(dbName).collection(collectionName);

    // Realiza una consulta en la colección
    const products = await collection.find({}).toArray();
    
    

    return products;
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    throw error;
  }
};

module.exports = {
  listProducts,
};



