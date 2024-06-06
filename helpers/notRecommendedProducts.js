const notRecommendedProducts = (products, bloodType) => {
  console.log("filtrando segun bloodtype:", bloodType);
  const filteredProducts = products
    .filter((product) => product.groupBloodNotAllowed[bloodType] === true)
    .map((product) => product.title);

  return filteredProducts.slice(0, 4);
};

module.exports = notRecommendedProducts;
