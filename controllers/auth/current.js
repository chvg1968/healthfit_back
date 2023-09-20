const current = async (req, res, next) => {
  const {
    email,
    name,
    userInfo,
    userDailyCalorieIntake,
    userNotRecommendedProducts,
    avatarURL,
  } = req.user;

  res.status(200).json({
    status: "Success",
    code: 200,
    data: {
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

module.exports = current;
