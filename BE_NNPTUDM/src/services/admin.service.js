const prisma = require("@/libs/prisma");
// const paginationService = require("@/utils/pagination");

function serializeBigInt(data) {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
  );
}

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"];

const ALLOWED_STATUS_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const adminService = {
  // CRUD
  findBrand: async (brandName) => {
    const brand = await prisma.brand.findFirst({
      where: {
        name: {
          equals: brandName.trim(),
        },
      },
    });

    return brand;
  },

  findCategory: async (categoryName) => {
    const category = await prisma.category.findFirst({
      where: {
        name: {
          equals: categoryName.trim(),
        },
      },
    });

    return category;
  },

  // MANAGER
  findAllProducts: async () => {
    const products = await prisma.product.findMany();
    return products;
  },

  findAllUsers: async () => {
    const users = await prisma.user.findMany({
      // Không filter nữa => lấy toàn bộ user
      omit: {
        password: true,
      },
    });

    return users;
  },

  findAllQuantity: async () => {
    const response = await prisma.productVariant.findMany({
      select: {
        quantity: true,
      },
    });
    return response.map((item) => item.quantity);
  },

  // Product
  createProduct: async ({ name, description, production, brand, category, productImages, productVariants }) => {
    try {
      if (!name?.trim()) {
        throw new Error("Tên sản phẩm không được để trống");
      }

      if (!brand?.id) {
        throw new Error("Thiếu thương hiệu");
      }

      if (!category?.id) {
        throw new Error("Thiếu danh mục");
      }

      const validImages = Array.isArray(productImages) ? productImages.map((img) => String(img?.url || img).trim()).filter(Boolean) : [];

      const validVariants = Array.isArray(productVariants)
        ? productVariants
            .map((variant) => ({
              size: String(variant.size).replace("ml", "").trim(),
              price: Number(variant.price),
              quantity: Number(variant.quantity),
            }))
            .filter((variant) => variant.size && !Number.isNaN(variant.price) && variant.price >= 0 && !Number.isNaN(variant.quantity) && variant.quantity >= 0)
        : [];

      if (validVariants.length === 0) {
        throw new Error("Phải có ít nhất 1 biến thể sản phẩm");
      }

      const product = await prisma.product.create({
        data: {
          name: String(name).trim(),
          description: description ? String(description).trim() : null,
          production: Number(production),
          brandId: brand.id,
          categoryId: Number(category.id),

          images: {
            create: validImages.map((imageUrl) => ({
              url: imageUrl,
            })),
          },

          variants: {
            create: validVariants.map((variant) => ({
              capacity: Number(variant.size),
              price: variant.price.toString(),
              quantity: variant.quantity,
            })),
          },
        },
        include: {
          images: true,
          variants: true,
          brand: true,
          category: true,
        },
      });

      return product;
    } catch (error) {
      if (error.code === "P2002") {
        throw new Error("Sản phẩm đã tồn tại");
      }
      throw error;
    }
  },

  updateProduct: async (id, { name, description, production, brand, category, productImages, productVariants }) => {
    // Check tồn tại product
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!existingProduct) {
      const err = new Error("Sản phẩm không tồn tại");
      err.statusCode = 404;
      throw err;
    }

    // Update
    const updatedProduct = await prisma.product.update({
      where: {
        id: id,
      },
      data: {
        name: name ? String(name).trim() : undefined,
        description: description !== undefined ? (description ? String(description).trim() : null) : undefined,
        production: production !== undefined ? Number(production) : undefined,
        brandId: brand ? brand.id : undefined,
        categoryId: category ? Number(category.id) : undefined,

        images: {
          update: productImages.map((image) => ({
            where: { id: Number(image.id) },
            data: { url: image.url },
          })),
        },

        variants: {
          update: productVariants.map((variant) => ({
            where: { id: variant.id },
            data: {
              capacity: Number(variant.size.replace("ml", "").trim()),
              price: variant.price.toString(),
              quantity: variant.quantity,
            },
          })),
        },
      },
    });

    return updatedProduct;
  },

  deleteProduct: async (id) => {
    // Check tồn tại
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!existingProduct) {
      const err = new Error("Sản phẩm không tồn tại");
      err.statusCode = 404;
      throw err;
    }

    // Xóa
    await prisma.product.delete({
      where: {
        id: id,
      },
    });

    return {
      message: "Xóa sản phẩm thành công",
    };
  },

  // User
  updateUser: async (userId, payload) => {
    const id = userId;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error("USER_NOT_FOUND");
    }

    const { username, email, password, firstName, lastName, avatar, isVerified, emailVerifiedAt } = payload;

    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        throw new Error("EMAIL_ALREADY_EXISTS");
      }
    }

    if (username && username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({
        where: { username },
      });

      if (usernameExists) {
        throw new Error("USERNAME_ALREADY_EXISTS");
      }
    }

    const dataToUpdate = {};

    if (username !== undefined) dataToUpdate.username = username;
    if (email !== undefined) dataToUpdate.email = email;
    if (firstName !== undefined) dataToUpdate.firstName = firstName;
    if (lastName !== undefined) dataToUpdate.lastName = lastName;
    if (avatar !== undefined) dataToUpdate.avatar = avatar;
    if (isVerified !== undefined) dataToUpdate.isVerified = isVerified;
    if (emailVerifiedAt !== undefined) {
      dataToUpdate.emailVerifiedAt = emailVerifiedAt ? new Date(emailVerifiedAt) : null;
    }

    if (password !== undefined && password !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isVerified: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
    });

    return {
      ...updatedUser,
      id: updatedUser.id.toString(),
    };
  },

  deleteUser: async (id) => {
    // Kiểm tra tồn tại
    const existingUser = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!existingUser) {
      const err = new Error("Người dùng không tồn tại");
      err.statusCode = 404;
      throw err;
    }

    const userId = id;

    // Xóa dữ liệu liên quan trước
    await prisma.refreshToken.deleteMany({
      where: {
        userId: userId,
      },
    });

    // Xóa user
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return {
      message: "Xóa người dùng thành công",
    };
  },

  getOrders: async ({ status, page, limit, search }) => {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (status && ORDER_STATUSES.includes(String(status).toUpperCase())) {
      where.status = String(status).toUpperCase();
    }

    if (search && String(search).trim()) {
      where.orderCode = {
        contains: String(search).trim(),
      };
    }

    const [orders, totalItems] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));

    return serializeBigInt({
      orders,
      totalPages,
      currentPage: pageNum,
      totalItems,
    });
  },

  getOrderDetail: async (id) => {
    let orderId;
    try {
      orderId = BigInt(id);
    } catch {
      const err = new Error("INVALID_ORDER_ID");
      err.code = "INVALID_ORDER_ID";
      throw err;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!order) {
      const err = new Error("ORDER_NOT_FOUND");
      err.code = "ORDER_NOT_FOUND";
      throw err;
    }

    return serializeBigInt(order);
  },

  updateOrderStatus: async (id, newStatus) => {
    const normalized = String(newStatus || "").toUpperCase();
    if (!ORDER_STATUSES.includes(normalized)) {
      const err = new Error("Trạng thái không hợp lệ");
      err.code = "INVALID_STATUS";
      throw err;
    }

    let orderId;
    try {
      orderId = BigInt(id);
    } catch {
      const err = new Error("INVALID_ORDER_ID");
      err.code = "INVALID_ORDER_ID";
      throw err;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      const err = new Error("ORDER_NOT_FOUND");
      err.code = "ORDER_NOT_FOUND";
      throw err;
    }

    const current = order.status;
    const allowed = ALLOWED_STATUS_TRANSITIONS[current] || [];

    if (allowed.length === 0) {
      const err = new Error(`Không thể thay đổi trạng thái đơn ở trạng thái "${current}"`);
      err.code = "INVALID_TRANSITION";
      throw err;
    }

    if (!allowed.includes(normalized)) {
      const err = new Error(
        `Chỉ được chuyển từ ${current} sang: ${allowed.join(", ")}`,
      );
      err.code = "INVALID_TRANSITION";
      throw err;
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: normalized },
      include: {
        orderItems: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return serializeBigInt(updated);
  },
};

module.exports = adminService;
