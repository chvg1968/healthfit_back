const { productService } = require("../services");


const getAllProducts = async (req, res, next) => {
  try {
    const lang = req.query.lang || 'es'; // Establece 'es' como idioma predeterminado si no se proporciona uno

    // Utiliza el servicio para obtener los productos según el idioma
    const products = await productService.listProducts(lang);

    res.status(200).json({
      status: 'OK',
      code: 200,
      data: {
        resultItems: products.length,
        result: products,
      },
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

const getProductsForQuery = async (req, res, next) => {
  const { query = "" } = req.query;
  const products = await productService.listProducts();

  const arrayFoundProducts = [];

  products.filter((prod) => {
    const itemProduct = prod.title.toString().toLowerCase().trim();
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

module.exports = { getAllProducts, getProductsForQuery };
