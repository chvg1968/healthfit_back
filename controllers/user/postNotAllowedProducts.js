const { Product, schemas } = require("../../models/Product");
const { User } = require("../../models/User");
const { createError, calculateCalories } = require("../../helpers");

const postNotAllowedProducts = async (req, res, next) => {
  try {
    const { error } = schemas.getDataForBMR.validate(req.body);
    if (error) {
      throw createError(400, error.message);
    }
    const { bloodType } = req.params;
    const { _id } = req.user;
    const notAllowedProducts = await await Product.find(
      { ["groupBloodNotAllowed." + bloodType]: { $eq: true } },
      "-__v ",
      { limit: 50, sort: { calories: -1 } }
    );
    if (!notAllowedProducts) {
      throw createError(404);
    }
    const calories = calculateCalories(req.body);
    const parameters = {
      ...req.body,
      calories,
    };
    const result = await User.findByIdAndUpdate(
      _id,
      { parameters, notAllowedProducts },
      { new: true }
    );
    if (!result) {
      createError(404);
    }
    const response = {
      products: [...notAllowedProducts],
      calories,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = postNotAllowedProducts;
