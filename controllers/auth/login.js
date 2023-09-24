const { User } = require("../../models");
const { userServices } = require("../../services");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Registro de depuración para verificar las credenciales
    console.log("Email:", email);
    console.log("Password:", password);

    const user = await User.findOne({ email });

    // Punto de control: verifica si el usuario se encuentra en la base de datos
    if (!user) {
      console.log("User not found in the database");
      throw new Error("Email or password is wrong");
    }

    // Punto de control: verifica si la comparación de contraseñas es exitosa
    if (!user.comparePassword(password)) {
      console.log("Password comparison failed");
      throw new Error("Email or password is wrong");
    }

    let {
      _id: userId,
      tokens,
      name,
      userInfo,
      userDailyCalorieIntake,
      userNotRecommendedProducts,
      avatarURL,
    } = user;

    // Actualiza tokens
    tokens = await userServices.updateTokens(userId);

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        tokens,
        user: {
          email,
          name,
          userInfo,
          userDailyCalorieIntake,
          userNotRecommendedProducts,
          avatarURL,
        },
      },
    });
  } catch (error) {
    // Manejo de errores aquí
    console.error("Login error:", error.message);
    res.status(401).json({
      success: false,
      error: error.message || "Email or password is wrong",
    });
  }
};

module.exports = login;
