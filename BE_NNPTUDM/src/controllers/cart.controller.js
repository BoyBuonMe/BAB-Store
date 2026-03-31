const cartService = require("@/services/cart.service");

const addToCartController = async (req, res, next) => {
  
  try {
    const userId = req.auth.user.id;
    
    const { productVariantId, quantity } = req.body;

    const result = await cartService.addToCart({
      userId,
      productVariantId,
      quantity: Number(quantity || 1),
    });

    return res.success({
      message: "Add to cart successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMyCartController = async (req, res, next) => {
  try {
    const userId = req.auth.user.id;

    const result = await cartService.getMyCart(userId);

    return res.success({
      message: "Get cart successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItemQuantityController = async (req, res, next) => {
  try {
    const userId = req.auth.user.id;
    const { cartItemId, quantity } = req.body;

    const result = await cartService.updateCartItemQuantity({
      userId,
      cartItemId,
      quantity: Number(quantity),
    });

    return res.success({
      message: "Update cart item successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const removeCartItemController = async (req, res, next) => {
  try {
    const userId = req.auth.user.id;
    
    const { cartItemId } = req.body;

    const result = await cartService.removeCartItem({
      userId,
      cartItemId,
    });

    return res.success({
      message: "Remove cart item successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addToCartController, getMyCartController, updateCartItemQuantityController, removeCartItemController };
