function filterUnique(array) {
  const unique = [];
  const keys = [];

  array.forEach((obj) => {
    const objKey = Object.values(obj).join("");
    if (!keys.includes(objKey)) {
      keys.push(objKey);
      unique.push(obj);
    }
  });

  return unique;
}

const notRecommendedProducts = (products, bloodType) => {
  const notRecommendedProducts = products
    .filter((product) => product.groupBloodNotAllowed[bloodType] === true)
    .map((product) => product.title);

  const unique = filterUnique(notRecommendedProducts);

  return unique;
};

module.exports = notRecommendedProducts;

