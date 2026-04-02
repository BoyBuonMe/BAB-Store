const prisma = require("@/libs/prisma");
const { serializeBigInt } = require("@/utils/serializeBigInt");

function generateOrderCode() {
  const now = Date.now();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD${now}${random}`;
}

const orderService = {
  createOrderService: async (userId, payload) => {
    const { items, shippingAddress, paymentMethod, totalQuantity, totalAmount, shippingFee, grandTotal, status } = payload;

    console.log(items);
    console.log(userId);

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Không có sản phẩm để thanh toán");
    }

    if (!shippingAddress?.addressLine?.trim()) {
      throw new Error("Thiếu địa chỉ cụ thể");
    }

    if (!shippingAddress?.ward?.trim()) {
      throw new Error("Thiếu phường / xã");
    }

    if (!shippingAddress?.city?.trim()) {
      throw new Error("Thiếu tỉnh / thành phố");
    }

    if (!paymentMethod) {
      throw new Error("Thiếu phương thức thanh toán");
    }

    const orderCode = generateOrderCode();

    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Kiểm tra tồn kho trước khi tạo đơn
      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: {
            id: item.productVariantId,
          },
          select: {
            id: true,
            quantity: true,
          },
        });

        if (!variant) {
          throw new Error(`Biến thể sản phẩm không tồn tại: ${item.productVariantId}`);
        }

        if (Number(variant.quantity) < Number(item.quantity)) {
          throw new Error(`Sản phẩm ${item.productName} không đủ tồn kho. Còn lại: ${variant.quantity}`);
        }
      }

      // 2. Tạo đơn hàng
      const order = await tx.order.create({
        data: {
          orderCode,
          userId: userId,
          totalQuantity: Number(totalQuantity),
          totalAmount: totalAmount.toString(),
          shippingFee: shippingFee.toString(),
          grandTotal: grandTotal.toString(),
          paymentMethod,
          addressLine: shippingAddress.addressLine.trim(),
          ward: shippingAddress.ward.trim(),
          city: shippingAddress.city.trim(),
          status: status || undefined,

          orderItems: {
            create: items.map((item) => ({
              cartItemId: item.cartItemId,
              productId: item.productId,
              productVariantId: item.productVariantId,
              productName: item.productName.toString(),
              quantity: Number(item.quantity),
              price: item.price.toString(),
              imageUrl: item.imageUrl.toString(),
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      // 3. Trừ tồn kho
      for (const item of items) {
        await tx.productVariant.update({
          where: {
            id: BigInt(item.productVariantId),
          },
          data: {
            quantity: {
              decrement: Number(item.quantity),
            },
          },
        });
      }

      return order;
    });

    return serializeBigInt(createdOrder);
  },

  getMyOrdersService: async (userId) => {
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return serializeBigInt(orders);
  },

  getMyOrderDetailService: async (userId, orderId) => {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId,
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return null;
    }

    return serializeBigInt(order);
  },
};

module.exports = orderService;
