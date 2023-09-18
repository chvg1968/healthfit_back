const { Product, schemas } = require("../../models/Product");
const { createError, calculateCalories } = require("../../helpers");

const getNotAllowedProducts = async (req, res, next) => {
  try {
      const { error } = schemas.getDataForBMR.validate(req.body);
      if (error) {
          throw createError(400, error.message);
      }
      const { bloodType } = req.params;
      const notAllowedProducts = await Product.find({ ["groupBloodNotAllowed." + bloodType]: { $eq: true }}, '-__v ', {limit: 50, sort: { calories: -1}});
      if (!notAllowedProducts) {
          throw createError(404)
      }
      const calories = calculateCalories(req.body)
      const result = {
          products: [...notAllowedProducts],
          calories
      };
      res.json(result);
  } catch (error) {
      next(error);
  }
};
module.exports = getNotAllowedProducts;
