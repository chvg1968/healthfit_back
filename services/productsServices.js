const { Product } = require("../models");

const listProducts = async (language) => {
  const titleField = `title.${language}`;
  const products = await Product.find().select({ title: titleField }).lean();
  return products;
};

module.exports = {
  listProducts,
};

