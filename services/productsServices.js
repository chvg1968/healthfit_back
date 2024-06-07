const { Product } = require("../models");


const listProducts = async (lang) => {
  const products = await Product.find({}, { title: 1, categories: 1, weight: 1, calories: 1, groupBloodNotAllowed: 1 }).lean();
  return products;
};


module.exports = {
  listProducts,
};




