const UserModel = require("./user.model");
const DayModel = require("../day/day.model");
const SummaryModel = require("../summary/summary.model");

module.exports.getUserInfo = async (req, res, next) => {
  const user = req.user;

  await UserModel.findOne({ _id: user._id })
    .populate({
      path: "days",
      model: DayModel,
      populate: [{ path: "daySummary", model: SummaryModel }],
    })
    .exec((err, data) => {
      if (err) {
        next(err);
      }

      return res.status(200).send({
        username: data.username,
        email: data.email,
        id: data._id,
        userData: data.userData,
        days: data.days,
      });
    });
};
