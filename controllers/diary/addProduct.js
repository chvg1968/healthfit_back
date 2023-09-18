const { Diary } = require("../../models/Diary");
const updateDiaryInfo = require("./updateDiaryInfo");
const { createError } = require("../../helpers");

const addProduct = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const { date, title, caloriesBasic } = req.body;
    const _id = req.body.productId;
    const weight = Number(req.body.weight) ?? 100;
    let productList = [];
    const diaryInfo = await Diary.findOne({ date, owner });

    if (!diaryInfo) {
      const calories = Math.round((weight * caloriesBasic) / 100);
      const result = await updateDiaryInfo({
        owner,
        date,
        productList: [{ _id, weight, title, calories }],
      });
      res.status(201).json(result);
    } else {
      productList = diaryInfo?.productList ?? [];
      const indexProduct = productList.findIndex(
        (el) => el._id.toString() === _id.toString()
      );
      if (indexProduct === -1) {
        const calories = Math.round((weight * caloriesBasic) / 100);
        productList = [...productList, { _id, weight, title, calories }];
      } else {
        productList[indexProduct].weight =
          productList[indexProduct].weight + weight ?? weight;
        productList[indexProduct].calories = Math.round(
          (productList[indexProduct].weight * caloriesBasic) / 100
        );
      }

      const result = await updateDiaryInfo({ owner, date, productList });
      if(result.status === 404) {
        throw createError(404)
      }
      res.status(201).json(result);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = addProduct;
