import { IProduct } from "./../helpers/typescript-helpers/interfaces";
import { Request, Response } from "express";
import { Document } from "mongoose";
import ProductModel from "../REST-entities/product/product.model";

export const countDailyRate = async (req: Request, res: Response) => {
  const { height, weight, age, desiredWeight, bloodType } = req.body;
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
  return res.status(200).send({ dailyRate, notAllowedProducts });
};
