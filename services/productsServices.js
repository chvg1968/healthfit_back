// const { Product } = require("../models");

// const listProducts = async () => {
//   return await Product.find();
// };

// console.log(listProducts); 

// module.exports = {
//   listProducts,
// };
const { Product } = require("../models");
const listProducts = async (lang) => {
    return await Product.find({ [`title.${lang}`]: { $exists: true } });
};

module.exports = {
  listProducts,
};
