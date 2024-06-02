const { productService } = require("../services");
const getAllProducts = async (req, res, next) => {
  const lang = req.params.lang || "en";
 // Valor predeterminado si no se proporciona
  try {
    const products = await productService.listProducts(lang);
    const result = products.map(
      ({ _id, title, categories, weight, calories, groupBloodNotAllowed }) => ({
        _id,
        title,
        categories,
        weight,
        calories,
        groupBloodNotAllowed,
        // Agrega otros campos según sea necesario
      })
    );

    res.status(200).json({
      status: "OK",
      code: 200,
      data: {
        resultItems: products.length,
        result,
      },
    });
  } catch (error) {
    console.error("Error on controller to get products", error);
    return res.status(500).json({
      status: "Error",
      code: 500,
      message: "Error to get products",
    });
  }
};

const getProductsForQuery = async (req, res, next) => {
  try {
    const { query = "", lang = "es" } = req.query;

    const products = await productService.listProducts(lang);

    const arrayFoundProducts = products
      .filter((prod) => {
        const itemProduct = prod.title[lang].toLowerCase().trim();
        return itemProduct.includes(query.toLowerCase().trim());
      })
      .map(({ _id, title }) => ({
        _id,
        title,
      }));

    res.status(200).json({
      status: "OK",
      code: 200,
      data: {
        resultItems: arrayFoundProducts.length,
        result: arrayFoundProducts,
      },
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error al obtener productos" });
  }
};

module.exports = { getAllProducts, getProductsForQuery };
