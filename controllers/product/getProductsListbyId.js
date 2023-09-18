const { Product } = require("../../models/Product");
const { createError } = require("../../helpers");

const getProductsListbyId = async (productListId = []) => {
  try {
    const result = await Product.find({ _id: { $in: productListId } });

    if (!result) {
      throw createError(404);
    }
    return result;
  } catch (error) {
    throw createError(404);
  }
};

module.exports = getProductsListbyId;
