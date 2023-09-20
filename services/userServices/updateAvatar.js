const { User } = require("../../models");

const updateUserAvatar = async (id, avatarURL) => {
  const userData = await User.findByIdAndUpdate(id, { avatarURL });

  return userData.avatarURL;
};

module.exports = updateUserAvatar;
