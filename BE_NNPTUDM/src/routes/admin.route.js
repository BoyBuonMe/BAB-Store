const express = require("express");

const authRequired = require("@/middlewares/authRequired");
const adminRequired = require("@/middlewares/adminRequired");

const adminController = require("@/controllers/admin.controller");

const router = express.Router();

// CRUD
router.post("/create-product", authRequired, adminRequired, adminController.createProductController);
router.post("/update-product", authRequired, adminRequired, adminController.updateProductController);
router.delete("/delete-product", authRequired, adminRequired, adminController.deleteProductController);

// MANAGER
router.get("/get-products", authRequired, adminRequired, adminController.getAllProducts);
router.get("/get-users", authRequired, adminRequired, adminController.getAllUsers);
router.get("/get-quantity", authRequired, adminRequired, adminController.getAllQuantity);

// USER
router.put("/update-user/:id", authRequired, adminRequired, adminController.updateUserController);
router.delete("/delete-user", authRequired, adminRequired, adminController.deleteUserController);

module.exports = router;