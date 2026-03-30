const express = require("express");
const authRequired = require("@/middlewares/authRequired");
const orderController = require("@/controllers/order.controller");

const router = express.Router();

router.post("/create", authRequired, orderController.createOrderController);
router.get("/my-orders", authRequired, orderController.getMyOrdersController);
router.get("/my-orders/:id", authRequired, orderController.getMyOrderDetailController);


module.exports = router;