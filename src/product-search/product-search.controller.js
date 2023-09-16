const ProductModel = require("../REST-entities/product/product.model");

const findProducts = async (req, res) => {
  const { search } = req.query;
  try {
    const foundProducts = await ProductModel.find({
      "title.ru": { $regex: search, $options: "i" },
    }).lean();

    const filteredProducts = foundProducts.filter((product) =>
      product.groupBloodNotAllowed[req.user.userData.bloodType] === false
    );

    if (!filteredProducts.length) {
      return res
        .status(400)
        .send({ message: "No allowed products found for this query" });
    }

    return res.status(200).send(filteredProducts);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = findProducts;
