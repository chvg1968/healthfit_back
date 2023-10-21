// const notRecommendedProducts = (products, bloodType) => {
//   const filteredProducts = products
//     .filter((product) => product.groupBloodNotAllowed[bloodType] === true)
//     .map((product) => product.title);

//   return filteredProducts.slice(0, 4);
// };

// module.exports = notRecommendedProducts;
const notRecommendedProducts = (products, bloodType, limit = 4) => {
  const filteredProducts = products.filter((product) => product.groupBloodNotAllowed[bloodType] === true);
  const result = filteredProducts.slice(0, limit).map((product) => product.title);

  return result;
};

module.exports = notRecommendedProducts;


