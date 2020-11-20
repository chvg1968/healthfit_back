import { Request, Response, NextFunction } from "express";
import ProductModel from "../REST-entities/product/product.model";

export const findProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { search } = req.query;
  let foundProducts;
  foundProducts = await ProductModel.find({
    "title.ru": { $regex: search, $options: "i" },
  }).lean();
  return res.status(200).send(foundProducts);
};
