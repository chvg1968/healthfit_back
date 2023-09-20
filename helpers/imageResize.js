const Jimp = require("jimp");

const imageResize = async (tempUpload) => {
  const image = await Jimp.read(tempUpload);
  image.resize(250, 250).write(tempUpload);
};

module.exports = imageResize;
