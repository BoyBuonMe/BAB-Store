const productService = require("@/services/product.service");
const { serializeBigInt } = require("@/utils/serializeBigInt");

const getCategories = async (req, res) => {
  const result = await productService.findCategories();
  res.success(result);
};

const getBrands = async (req, res) => {
  const result = await productService.findBrands();
  res.success(result);
};

const getAllProducts = async (req, res) => {
  try {
    // const page = Number(req.query.page) || 1;
    // const limit = Number(req.query.limit) || 6;
    const result = await productService.findAllProducts();
    
    res.success(result)
  } catch (error) {
    res.error(error);
  }
};

module.exports = { getCategories, getBrands, getAllProducts };
