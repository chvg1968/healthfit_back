const { productService } = require("../services");

const getAllProducts = async (req, res, next) => {
  const lang = req.params.lang || 'en'; // Valor predeterminado si no se proporciona
  try {
    // Lógica para obtener productos en el idioma especificado
    const products = await productService.listProducts(lang);
    return res.status(200).json({
      status: 'OK',
      code: 200,
      data: {
        resultItems: products.length,
        result: products,
      },
    });
  } catch (error) {
    console.error('Error on controller to get products', error);
    return res.status(500).json({
      status: 'Error',
      code: 500,
      message: 'Error to get products',
    });
  }
};




const getProductsForQuery = async (req, res, next) => {
  const { query = "" } = req.query;
  const products = await productService.listProducts();

  const arrayFoundProducts = [];

  products.filter((prod) => {
    const itemProduct = prod.title.toLowerCase().trim();
    if (itemProduct.includes(query.toLowerCase().trim())) {
      return arrayFoundProducts.push({
        title: prod.title,
        _id: prod._id,
      });
    }
    return arrayFoundProducts;
  });

  res.status(200).json({
    status: "OK",
    code: 200,
    data: {
      resultItems: arrayFoundProducts.length,
      result: arrayFoundProducts,
    },
  });
};





module.exports = { getAllProducts, getProductsForQuery};
