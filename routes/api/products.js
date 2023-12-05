const Router  = require("express");
const { ctrlWrapper } = require("../../middlewares");
const {
  productsCtrl: { getAllProducts, getProductsForQuery },
} = require("../../controllers");



const router = Router();

router.get("/:lang",  ctrlWrapper(getAllProducts));

router.get("/search", ctrlWrapper(getProductsForQuery));



module.exports = router;

