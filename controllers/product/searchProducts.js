const { Product } = require("../../models/Product");
const { createError } = require("../../helpers");

const searchProducts = async (req, res, next) => {
  try {
    const searchQuerry = new RegExp(req.params.searchQuerry, "gi");

    const result = await Product.find().or(
      { "title.ru": { $regex: searchQuerry } },
      { "title.ua": { $regex: searchQuerry } }
    );

    if (!result.length) {
      throw createError(404);
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = searchProducts;
