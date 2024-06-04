const { Product } = require("../models");

// const listProducts = async (lang) => {
//   const titleField = `title.${lang}`;
//   const projection = { [titleField]: 1, categories: 1, weight: 1, calories: 1, groupBloodNotAllowed: 1 };

//   const products = await Product.find({}, projection).lean();
//   // Remover el prefijo del idioma del campo del título en el resultado
//   products.forEach(product => {
//     product.title = product.title[lang];
//   });

//   return products;
// };
const listProducts = async (lang) => {
  const products = await Product.find({}, { title: 1, categories: 1, weight: 1, calories: 1, groupBloodNotAllowed: 1 }).lean();
  return products;
};


module.exports = {
  listProducts,
};




