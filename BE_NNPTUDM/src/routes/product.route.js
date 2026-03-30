const express = require("express");
const productController = require("@/controllers/product.controller");

const router = express.Router();

router.get("/categories", productController.getCategories);
router.get("/brands", productController.getBrands);


// router.get("/brand/:slug", productController.getProductsByBrand);
// router.get("/men-perfume", productController.getMenPerfume);
// router.get("/women-perfume", productController.getWomenPerfume);
// router.get("/unisex", productController.getUnisex);
// router.get("/filter", productController.getFilterProducts);
router.get("/products", productController.getAllProducts);


module.exports = router;