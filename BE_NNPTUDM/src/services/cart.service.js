const prisma = require("@/libs/prisma");
const { serializeBigInt } = require("@/utils/serializeBigInt");

const cartService = {
  addToCart: async ({ userId, productVariantId, quantity = 1 }) => {
    if (!userId) {
      throw new Error("User not found");
    }

    if (!productVariantId) {
      throw new Error("Product variant id is required");
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const parsedUserId = BigInt(userId);
    const parsedVariantId = BigInt(productVariantId);

    const result = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: {
          id: parsedVariantId,
        },
        include: {
          product: {
            include: {
              images: true,
              brand: true,
              category: true,
            },
          },
        },
      });

      if (!variant) {
        throw new Error("Product variant not found");
      }

      if (variant.quantity < parsedQuantity) {
        throw new Error("Not enough stock");
      }

      let cart = await tx.cart.findUnique({
        where: {
          userId: parsedUserId,
        },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: {
            userId: parsedUserId,
          },
        });
      }

      const existingCartItem = await tx.cartItem.findFirst({
        where: {
          userId: parsedUserId,
          productVariantId: parsedVariantId,
        },
      });

      let cartItem;

      if (existingCartItem) {
        const nextQuantity = existingCartItem.quantity + parsedQuantity;

        if (nextQuantity > variant.quantity) {
          throw new Error("Quantity exceeds stock");
        }

        cartItem = await tx.cartItem.update({
          where: {
            id: existingCartItem.id,
          },
          data: {
            quantity: {
              increment: parsedQuantity,
            },
            cartId: cart.id,
          },
          include: {
            product: {
              include: {
                images: true,
                brand: true,
                category: true,
              },
            },
            productVariant: true,
          },
        });
      } else {
        cartItem = await tx.cartItem.create({
          data: {
            userId: parsedUserId,
            cartId: cart.id,
            productId: variant.productId,
            productVariantId: parsedVariantId,
            quantity: parsedQuantity,
          },
          include: {
            product: {
              include: {
                images: true,
                brand: true,
                category: true,
              },
            },
            productVariant: true,
          },
        });
      }

      const fullCart = await tx.cart.findUnique({
        where: {
          id: cart.id,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  brand: true,
                  category: true,
                },
              },
              productVariant: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      const totalItems = fullCart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

      const totalPrice =
        fullCart?.items?.reduce((sum, item) => {
          return sum + Number(item.productVariant?.price || 0) * item.quantity;
        }, 0) || 0;

      return {
        cart: fullCart,
        cartItem,
        summary: {
          totalItems,
          totalPrice,
        },
      };
    });

    return serializeBigInt(result);
  },

  getMyCart: async (userId) => {
    const parsedUserId = userId;

    const cart = await prisma.cart.findUnique({
      where: {
        userId: parsedUserId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                brand: true,
                category: true,
              },
            },
            productVariant: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!cart) {
      return {
        cart: null,
        items: [],
        summary: {
          totalItems: 0,
          totalPrice: 0,
        },
      };
    }

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    const totalPrice = cart.items.reduce((sum, item) => {
      return sum + Number(item.priceAtTime) * item.quantity;
    }, 0);

    return serializeBigInt({
      cart,
      items: cart.items,
      summary: {
        totalItems,
        totalPrice,
      },
    });
  },

  updateCartItemQuantity: async ({ userId, cartItemId, quantity }) => {
    if (!quantity || quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const parsedUserId = BigInt(userId);
    const parsedCartItemId = BigInt(cartItemId);

    const result = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: {
          userId: parsedUserId,
        },
      });

      if (!cart) {
        throw new Error("Cart not found");
      }

      const cartItem = await tx.cartItem.findFirst({
        where: {
          id: parsedCartItemId,
          cartId: cart.id,
        },
        include: {
          productVariant: true,
        },
      });

      if (!cartItem) {
        throw new Error("Cart item not found");
      }

      if (quantity > cartItem.productVariant.quantity) {
        throw new Error("Quantity exceeds stock");
      }

      const updatedItem = await tx.cartItem.update({
        where: {
          id: cartItem.id,
        },
        data: {
          quantity,
        },
        include: {
          product: {
            include: {
              images: true,
              brand: true,
              category: true,
            },
          },
          productVariant: true,
        },
      });

      return updatedItem;
    });

    return serializeBigInt(result);
  },

  removeCartItem: async ({ userId, cartItemId }) => {
    const parsedUserId = BigInt(userId);
    const parsedCartItemId = BigInt(cartItemId);

    const result = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: {
          userId: parsedUserId,
        },
      });

      if (!cart) {
        throw new Error("Cart not found");
      }

      const cartItem = await tx.cartItem.findFirst({
        where: {
          id: parsedCartItemId,
          cartId: cart.id,
        },
      });

      if (!cartItem) {
        throw new Error("Cart item not found");
      }

      await tx.cartItem.delete({
        where: {
          id: parsedCartItemId,
        },
      });

      const updatedCart = await tx.cart.findUnique({
        where: {
          id: cart.id,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  brand: true,
                  category: true,
                },
              },
              productVariant: true,
            },
          },
        },
      });

      return updatedCart;
    });

    return serializeBigInt(result);
  },
};

module.exports = cartService;
