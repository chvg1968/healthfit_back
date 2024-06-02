const { listProducts } = require("../../services/productsServices");
const { dailyCalorieIntake } = require("../../helpers");
const { notRecommendedProducts } = require("../../helpers");

const getNotLoggedUserDietAdvice = async (req, res) => {
  console.log('Recibida solicitud a /users/nutrition-advice:', req.body.userData);

  // Obtener el valor de lang desde req.params
  const lang = req.params.lang || 'en';

  const userDailyCalorieIntake = dailyCalorieIntake(req.body.userData);
  const products = await listProducts(lang);  
  
  console.log("Estos son los productos filtrados por idioma:", products);// Pasar lang a listProducts

  const userNotRecommendedProducts = notRecommendedProducts(
    products,
     // Pasar lang a notRecommendedProducts
  );

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
};

module.exports = getNotLoggedUserDietAdvice;


