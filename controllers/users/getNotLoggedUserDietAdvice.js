const { listProducts } = require("../../services/productsServices");
const { dailyCalorieIntake } = require("../../helpers");
const { notRecommendedProducts } = require("../../helpers");

const getNotLoggedUserDietAdvice = async (req, res) => {
  try {
    console.log('Recibida solicitud a /users/nutrition-advice:', req.body.userData);

    // Obtener el valor de lang desde req.query (o req.params si es necesario)
    const lang = req.query.lang || 'en';

    const userDailyCalorieIntake = dailyCalorieIntake(req.body.userData);
    const products = await listProducts(lang);  

    console.log("Estos son los productos filtrados por idioma:", products);

    const userNotRecommendedProducts = notRecommendedProducts(products, req.body.userData.bloodType);

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
