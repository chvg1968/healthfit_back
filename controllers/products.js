const { productService } = require("../services");

const getAllProducts = async (req, res, next) => {
  try {
    const lang = req.query.lang || 'es'; // Set 'es' as the default language if none is provided

    const products = await productService.listProducts(lang);
    console.log(products);

    res.status(200).json({
      status: 'OK',
      code: 200,
      data: {
        resultItems: products.length,
        result: products.map((product) => ({
          _id: product._id,
          title: product.title[lang], // Access the title in the specified language
          // Include other fields as needed
        })),
      },
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};


const getProductsForQuery = async (req, res, next) => {
  try {
    const { query = "" } = req.query;
    const lang = req.query.lang || 'es'; // Set 'es' as the default language if none is provided

    const products = await productService.listProducts(lang);

    const arrayFoundProducts = products
      .filter((prod) => {
        const itemProduct = prod.title[lang].toLowerCase().trim();
        return itemProduct.includes(query.toLowerCase().trim());
      })
      .map((product) => ({
        _id: product._id,
        title: product.title[lang],
      }));

    res.status(200).json({
      status: 'OK',
      code: 200,
      data: {
        resultItems: arrayFoundProducts.length,
        result: arrayFoundProducts,
      },
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

module.exports = { getAllProducts, getProductsForQuery };