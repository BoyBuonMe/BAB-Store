const express = require("express");
const cartController = require("@/controllers/cart.controller");
const authRequired = require("@/middlewares/authRequired");

const router = express.Router();

router.get("/my-cart", authRequired, cartController.getMyCartController);
router.post("/add", authRequired, cartController.addToCartController);
router.patch("/update", authRequired, cartController.updateCartItemQuantityController);
router.delete("/delete", authRequired, cartController.removeCartItemController);


module.exports = router;