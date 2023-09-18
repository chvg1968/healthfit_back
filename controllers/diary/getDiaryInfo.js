const { Diary } = require("../../models/Diary");
const { createError } = require("../../helpers");
 
const getDiaryInfo = async (req, res, next) => {
  try {
    const date = req.params.date;
    const owner = req.user._id;
    const result = await Diary.findOne({ date, owner });

    if (!result) {
      throw createError(404);
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = getDiaryInfo;
