const { listProducts } = require("../../services/productsServices");
const { dailyCalorieIntake } = require("../../helpers");
const { notRecommendedProducts } = require("../../helpers");

const getNotLoggedUserDietAdvice = async (req, res) => {
  const userDailyCalorieIntake = dailyCalorieIntake(req.body.userData);
  const products = await listProducts();

  const userNotRecommendedProducts = notRecommendedProducts(
    products,
    req.body.userData.bloodType
  );

  res.json({
    status: "success",
    code: 200,
    data: {
      nutritionAdvice: {
        userDailyCalorieIntake,
        userNotRecommendedProducts,
      },
    },
  });
};

module.exports = getNotLoggedUserDietAdvice;
