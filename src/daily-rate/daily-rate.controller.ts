import { IProduct } from "./../helpers/typescript-helpers/interfaces";
import { Request, Response } from "express";
import { Document } from "mongoose";
import ProductModel from "../REST-entities/product/product.model";
import { IMom, IDaySummary } from "../helpers/typescript-helpers/interfaces";
import UserModel from "../REST-entities/user/user.model";
import SummaryModel from "../REST-entities/summary/summary.model";

export const countDailyRate = async (req: Request, res: Response) => {
  const { height, weight, age, desiredWeight, bloodType } = req.body;
  const { userId } = req.params;
  const dailyRate =
    10 * weight + 6.25 * height - 5 * age - 161 - 10 * (weight - desiredWeight);
  let notAllowedProductsObj: Document[] = [];
  switch (bloodType) {
    case 1:
      notAllowedProductsObj = await ProductModel.find({
        "groupBloodNotAllowed.1": true,
      }).lean();
      break;
    case 2:
      notAllowedProductsObj = await ProductModel.find({
        "groupBloodNotAllowed.2": true,
      }).lean();
      break;
    case 3:
      notAllowedProductsObj = await ProductModel.find({
        "groupBloodNotAllowed.3": true,
      }).lean();
      break;
    case 4:
      notAllowedProductsObj = await ProductModel.find({
        "groupBloodNotAllowed.4": true,
      }).lean();
      break;
    default:
      break;
  }
  const notAllowedProducts = [
    ...new Set(
      notAllowedProductsObj.map((product) => (product as IProduct).title.ru)
    ),
  ];
  if (userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "Invalid user" });
    }
    (user as IMom).userData = {
      weight,
      height,
      age,
      bloodType,
      desiredWeight,
      dailyRate,
      notAllowedProducts,
    };
    await (user as IMom).save();
    const summariesToUpdate = await SummaryModel.find({ userId });
    if (summariesToUpdate) {
      summariesToUpdate.forEach((summary) => {
        if ((summary as IDaySummary).dailyRate > dailyRate) {
          const diff = (summary as IDaySummary).dailyRate - dailyRate;
          (summary as IDaySummary).dailyRate = dailyRate;
          (summary as IDaySummary).kcalLeft -= diff;
          (summary as IDaySummary).percentsOfDailyRate =
            ((summary as IDaySummary).kcalConsumed * 100) / dailyRate;
        }
        if ((summary as IDaySummary).dailyRate < dailyRate) {
          const diff = dailyRate - (summary as IDaySummary).dailyRate;
          (summary as IDaySummary).dailyRate = dailyRate;
          (summary as IDaySummary).kcalLeft += diff;
          (summary as IDaySummary).percentsOfDailyRate =
            ((summary as IDaySummary).kcalConsumed * 100) / dailyRate;
        }
        (summary as IDaySummary).save();
      });
    }
    return res.status(201).send({
      id: (user as IMom)._id,
      dailyRate,
      summaries: summariesToUpdate,
      notAllowedProducts,
    });
  }
  return res.status(200).send({ dailyRate, notAllowedProducts });
};
