const { listProducts } = require("../../services/productsServices");
const { dailyCalorieIntake } = require("../../helpers");
const { notRecommendedProducts } = require("../../helpers");

const getNotLoggedUserDietAdvice = async (req, res) => {
  console.log(
    "Recibida solicitud a /users/nutrition-advice:",
    req.body.userData
  );

  // Obtener el valor de lang desde req.params
  const lang = req.params.lang || "en";

  const userDailyCalorieIntake = dailyCalorieIntake(req.body.userData);
  const products = await listProducts(lang);

  const userNotRecommendedProducts = notRecommendedProducts(
    products,
    req.body.userData.bloodType
    // Pasar lang a notRecommendedProducts
  );

  console.log("userNotRecommendedProducts:", userNotRecommendedProducts);

    console.log('userNotRecommendedProducts:', userNotRecommendedProducts);

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
  } catch (error) {
    console.error('Error al obtener el consejo nutricional:', error);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = getNotLoggedUserDietAdvice;
