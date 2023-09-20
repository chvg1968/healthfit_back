const { User } = require("../../models");
const { userServices } = require("../../services");

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.comparePassword(password)) {
    throw new TypeError();
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
};

module.exports = login;
