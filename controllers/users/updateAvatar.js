const fs = require("fs/promises");
const { userServices } = require("../../services");
const { cloudinary } = require("../../helpers/cloudinary");
const { imageResize } = require("../../helpers");

const updateAvatar = async (req, res) => {
  const { path: tempUpload } = req.file;

  await imageResize(tempUpload);

  const uploadResponse = await cloudinary.uploader.upload(tempUpload, {
    upload_preset: "ml_default",
  });

  const avatarURL = await userServices.updateUserAvatar(
    req.user._id,
    uploadResponse.url
  );

  await fs.unlink(tempUpload);

  res.json({ avatarURL });
};

module.exports = updateAvatar;
