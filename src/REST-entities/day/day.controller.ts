import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import UserModel from "../user/user.model";
import ProductModel from "../product/product.model";
import SummaryModel from "../summary/summary.model";
import DayModel from "./day.model";
import { IProduct } from "../../helpers/typescript-helpers/interfaces";
import {
  IMom,
  IMomPopulated,
  IDay,
  IDayPopulated,
  IDaySummary,
} from "../../helpers/typescript-helpers/interfaces";

export const addProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { date, productId, weight } = req.body;
  const product = await ProductModel.findById(productId);
  if (!product) {
    return res.status(404).send({ message: "Product not found" });
  }
  await UserModel.findById((req.user as IMom)._id)
    .populate("days")
    .exec(async (err, data) => {
      if (err) {
        next(err);
      }
      const existingDay = (data as IMomPopulated).days.find(
        (day) => (day as IDay).date === date
      );
      const kcalCoefficient =
        (product as IProduct).calories / (product as IProduct).weight;
      const kcalConsumed = kcalCoefficient * weight;
      const eatenProduct = {
        title: (product as IProduct).title.ru,
        weight,
        kcal: kcalConsumed,
        id: uuid(),
      };
      if (existingDay) {
        (existingDay as IDay).eatenProducts.push(eatenProduct);
        await (existingDay as IDay).save();
        const daySummary = await SummaryModel.findOne({
          $and: [{ date: date }, { userId: (req.user as IMom)._id }],
        });
        (daySummary as IDaySummary).kcalLeft -= kcalConsumed;
        (daySummary as IDaySummary).kcalConsumed += kcalConsumed;
        (daySummary as IDaySummary).percentsOfDailyRate =
          ((daySummary as IDaySummary).kcalConsumed * 100) /
          (req.user as IMom).userData.dailyRate;
        if ((daySummary as IDaySummary).kcalLeft < 0) {
          (daySummary as IDaySummary).kcalLeft = 0;
          (daySummary as IDaySummary).percentsOfDailyRate = 100;
        }
        await (daySummary as IDaySummary).save();
        return res.status(201).send({
          eatenProduct,
          day: {
            id: (existingDay as IDay)._id,
            eatenProducts: (existingDay as IDay).eatenProducts,
            date: (existingDay as IDay).date,
            daySummary: (existingDay as IDay).daySummary,
          },
          daySummary: {
            date: (daySummary as IDaySummary).date,
            kcalLeft: (daySummary as IDaySummary).kcalLeft,
            kcalConsumed: (daySummary as IDaySummary).kcalConsumed,
            dailyRate: (daySummary as IDaySummary).dailyRate,
            percentsOfDailyRate: (daySummary as IDaySummary)
              .percentsOfDailyRate,
            userId: (daySummary as IDaySummary).userId,
            id: (daySummary as IDaySummary)._id,
          },
        });
      }
      const newSummary = await SummaryModel.create({
        date,
        kcalLeft: (req.user as IMom).userData.dailyRate - kcalConsumed,
        kcalConsumed,
        dailyRate: (req.user as IMom).userData.dailyRate,
        percentsOfDailyRate:
          (kcalConsumed * 100) / (req.user as IMom).userData.dailyRate,
        userId: (req.user as IMom)._id,
      });
      if ((newSummary as IDaySummary).kcalLeft < 0) {
        (newSummary as IDaySummary).kcalLeft = 0;
        (newSummary as IDaySummary).percentsOfDailyRate = 100;
        await newSummary.save();
      }
      const newDay = await DayModel.create({
        date,
        eatenProducts: [eatenProduct],
        daySummary: newSummary._id,
      });
      (req.user as IMom).days.push(newDay._id);
      await (req.user as IMom).save();
      return res.status(201).send({
        eatenProduct,
        newDay: {
          id: (newDay as IDay)._id,
          eatenProducts: (newDay as IDay).eatenProducts,
          date: (newDay as IDay).date,
          daySummary: (newDay as IDay).daySummary,
        },
        newSummary: {
          date: (newSummary as IDaySummary).date,
          kcalLeft: (newSummary as IDaySummary).kcalLeft,
          kcalConsumed: (newSummary as IDaySummary).kcalConsumed,
          dailyRate: (newSummary as IDaySummary).dailyRate,
          percentsOfDailyRate: (newSummary as IDaySummary).percentsOfDailyRate,
          userId: (newSummary as IDaySummary).userId,
          id: (newSummary as IDaySummary)._id,
        },
      });
    });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { dayId, eatenProductId } = req.body;
  const day = await DayModel.findById(dayId);
  if (!(req.user as IMom).days.find((day) => day.toString() === dayId)) {
    return res.status(404).send({ message: "Day not found" });
  }
  const product = (day as IDay).eatenProducts.find(
    (product) => product.id === eatenProductId
  );
  if (!product) {
    return res.status(404).send({ message: "Product not found" });
  }
  await DayModel.findByIdAndUpdate(dayId, {
    $pull: { eatenProducts: { id: eatenProductId } },
  });
  const daySummary = await SummaryModel.findById((day as IDay).daySummary);
  (daySummary as IDaySummary).kcalLeft += product.kcal;
  (daySummary as IDaySummary).kcalConsumed -= product.kcal;
  (daySummary as IDaySummary).percentsOfDailyRate =
    ((daySummary as IDaySummary).kcalConsumed * 100) /
    (req.user as IMom).userData.dailyRate;
  await (daySummary as IDaySummary).save();
  return res.status(201).send({
    newDaySummary: {
      date: (daySummary as IDaySummary).date,
      kcalLeft: (daySummary as IDaySummary).kcalLeft,
      kcalConsumed: (daySummary as IDaySummary).kcalConsumed,
      dailyRate: (daySummary as IDaySummary).dailyRate,
      percentsOfDailyRate: (daySummary as IDaySummary).percentsOfDailyRate,
      userId: (daySummary as IDaySummary).userId,
      id: (daySummary as IDaySummary)._id,
    },
  });
};

export const getDayInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { date } = req.body;
  UserModel.findById((req.user as IMom)._id)
    .populate("days")
    .exec((err, data) => {
      if (err) {
        next(err);
      }
      const dayInfo = (data as IMomPopulated).days.find(
        (day) => (day as IDay).date === date
      );
      if (!dayInfo) {
        return res.status(200).send({
          kcalLeft: (req.user as IMom).userData.dailyRate,
          kcalConsumed: 0,
          dailyRate: (req.user as IMom).userData.dailyRate,
          percentsOfDailyRate: 0,
        });
      }
      DayModel.findById((dayInfo as IDay)._id)
        .populate("daySummary")
        .exec((err, data) => {
          if (err) {
            next(err);
          }
          return res.status(200).send({
            id: (data as IDayPopulated)._id,
            eatenProducts: (data as IDayPopulated).eatenProducts,
            date: (data as IDayPopulated).date,
            daySummary: {
              date: ((data as IDayPopulated).daySummary as IDaySummary).date,
              kcalLeft: ((data as IDayPopulated).daySummary as IDaySummary)
                .kcalLeft,
              kcalConsumed: ((data as IDayPopulated).daySummary as IDaySummary)
                .kcalConsumed,
              dailyRate: ((data as IDayPopulated).daySummary as IDaySummary)
                .dailyRate,
              percentsOfDailyRate: ((data as IDayPopulated)
                .daySummary as IDaySummary).percentsOfDailyRate,
              userId: ((data as IDayPopulated).daySummary as IDaySummary)
                .userId,
              id: ((data as IDayPopulated).daySummary as IDaySummary)._id,
            },
          });
        });
    });
};

export const checkDailyRate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(req.user as IMom).userData.dailyRate) {
    return res
      .status(403)
      .send({ message: "Please, count your daily rate first" });
  }
  next();
};
