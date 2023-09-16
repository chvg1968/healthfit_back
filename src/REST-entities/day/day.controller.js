const UserModel = require("../user/user.model");
const ProductModel = require("../product/product.model");
const SummaryModel = require("../summary/summary.model");
const DayModel = require("./day.model");
const { v4: uuid } = require("uuid");

const addProduct = async (req, res, next) => {
  const { date, productId, weight } = req.body;
  const product = await ProductModel.findById(productId);
  if (!product) {
    return res.status(404).send({ message: "Product not found" });
  }
  await UserModel.findById(req.user._id)
    .populate("days")
    .exec(async (err, data) => {
      if (err) {
        next(err);
      }
      const existingDay = data.days.find((day) => day.date === date);
      const kcalCoefficient = product.calories / product.weight;
      const kcalConsumed = kcalCoefficient * weight;
      const eatenProduct = {
        title: product.title.ru,
        weight,
        kcal: kcalConsumed,
        id: uuid(),
      };
      if (existingDay) {
        existingDay.eatenProducts.push(eatenProduct);
        await existingDay.save();
        const daySummary = await SummaryModel.findOne({
          $and: [{ date: date }, { userId: req.user._id }],
        });
        daySummary.kcalLeft -= kcalConsumed;
        daySummary.kcalConsumed += kcalConsumed;
        daySummary.percentsOfDailyRate =
          (daySummary.kcalConsumed * 100) / req.user.userData.dailyRate;
        if (daySummary.kcalLeft < 0) {
          daySummary.kcalLeft = 0;
          daySummary.percentsOfDailyRate = 100;
        }
        await daySummary.save();
        return res.status(201).send({
          eatenProduct,
          day: {
            id: existingDay._id,
            eatenProducts: existingDay.eatenProducts,
            date: existingDay.date,
            daySummary: existingDay.daySummary,
          },
          daySummary: {
            date: daySummary.date,
            kcalLeft: daySummary.kcalLeft,
            kcalConsumed: daySummary.kcalConsumed,
            dailyRate: daySummary.dailyRate,
            percentsOfDailyRate: daySummary.percentsOfDailyRate,
            userId: daySummary.userId,
            id: daySummary._id,
          },
        });
      }
      const newSummary = await SummaryModel.create({
        date,
        kcalLeft: req.user.userData.dailyRate - kcalConsumed,
        kcalConsumed,
        dailyRate: req.user.userData.dailyRate,
        percentsOfDailyRate: (kcalConsumed * 100) / req.user.userData.dailyRate,
        userId: req.user._id,
      });
      if (newSummary.kcalLeft < 0) {
        newSummary.kcalLeft = 0;
        newSummary.percentsOfDailyRate = 100;
        await newSummary.save();
      }
      const newDay = await DayModel.create({
        date,
        eatenProducts: [eatenProduct],
        daySummary: newSummary._id,
      });
      req.user.days.push(newDay._id);
      await req.user.save();
      return res.status(201).send({
        eatenProduct,
        newDay: {
          id: newDay._id,
          eatenProducts: newDay.eatenProducts,
          date: newDay.date,
          daySummary: newDay.daySummary,
        },
        newSummary: {
          date: newSummary.date,
          kcalLeft: newSummary.kcalLeft,
          kcalConsumed: newSummary.kcalConsumed,
          dailyRate: newSummary.dailyRate,
          percentsOfDailyRate: newSummary.percentsOfDailyRate,
          userId: newSummary.userId,
          id: newSummary._id,
        },
      });
    });
};

const deleteProduct = async (req, res) => {
  const { dayId, eatenProductId } = req.body;
  const day = await DayModel.findById(dayId);
  if (!req.user.days.find((day) => day.toString() === dayId)) {
    return res.status(404).send({ message: "Day not found" });
  }
  const product = day.eatenProducts.find((product) => product.id === eatenProductId);
  if (!product) {
    return res.status(404).send({ message: "Product not found" });
  }
  await DayModel.findByIdAndUpdate(dayId, {
    $pull: { eatenProducts: { id: eatenProductId } },
  });
  const daySummary = await SummaryModel.findById(day.daySummary);
  daySummary.kcalLeft += product.kcal;
  daySummary.kcalConsumed -= product.kcal;
  daySummary.percentsOfDailyRate =
    (daySummary.kcalConsumed * 100) / req.user.userData.dailyRate;
  if (daySummary.kcalLeft > req.user.userData.dailyRate) {
    daySummary.kcalLeft = req.user.userData.dailyRate;
  }
  await daySummary.save();
  return res.status(201).send({
    newDaySummary: {
      date: daySummary.date,
      kcalLeft: daySummary.kcalLeft,
      kcalConsumed: daySummary.kcalConsumed,
      dailyRate: daySummary.dailyRate,
      percentsOfDailyRate: daySummary.percentsOfDailyRate,
      userId: daySummary.userId,
      id: daySummary._id,
    },
  });
};

const getDayInfo = async (req, res, next) => {
  const { date } = req.body;
  UserModel.findById(req.user._id)
    .populate("days")
    .exec((err, data) => {
      if (err) {
        next(err);
      }
      const dayInfo = data.days.find((day) => day.date === date);
      if (!dayInfo) {
        return res.status(200).send({
          kcalLeft: req.user.userData.dailyRate,
          kcalConsumed: 0,
          dailyRate: req.user.userData.dailyRate,
          percentsOfDailyRate: 0,
        });
      }
      DayModel.findById(dayInfo._id)
        .populate("daySummary")
        .exec((err, data) => {
          if (err) {
            next(err);
          }
          return res.status(200).send({
            id: data._id,
            eatenProducts: data.eatenProducts,
            date: data.date,
            daySummary: {
              date: data.daySummary.date,
              kcalLeft: data.daySummary.kcalLeft,
              kcalConsumed: data.daySummary.kcalConsumed,
              dailyRate: data.daySummary.dailyRate,
              percentsOfDailyRate: data.daySummary.percentsOfDailyRate,
              userId: data.daySummary.userId,
              id: data.daySummary._id,
            },
          });
        });
    });
};

const checkDailyRate = async (req, res, next) => {
  if (!req.user.userData.dailyRate) {
    return res
      .status(403)
      .send({ message: "Please, count your daily rate first" });
  }
  next();
};

module.exports = { addProduct, deleteProduct, getDayInfo, checkDailyRate };
