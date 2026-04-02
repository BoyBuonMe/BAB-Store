const adminService = require("@/services/admin.service");
const { httpCodes } = require("@/config/constants");

// Product
const createProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      production,
      brandName,
      categoryName,
      productImages,
      productVariants,
    } = req.body;
    

    // Brand
    const brand = await adminService.findBrand(brandName);
    if (!brand) {
      return res.status(400).json({
        message: `Không tìm thấy brand: ${brandName}`,
      });
    }

    // Category
    const category = await adminService.findCategory(categoryName);
    if (!category) {
      return res.status(400).json({
        message: `Không tìm thấy category: ${categoryName}`,
      });
    }

    const product = await adminService.createProduct({
      name,
      description,
      production,
      brand,
      category,
      productImages,
      productVariants,
    });

    return res.success(product);
  } catch (error) {
    return res.error({
      message: error.message || "Lỗi tạo sản phẩm",
    });
  }
};

const updateProductController = async (req, res) => {
  try {
    const { id, name, description, production, brandName, categoryName, productImages, productVariants } = req.body;
    
    let brand = null;
    let category = null;

    // Nếu có truyền brandName thì mới tìm
    if (brandName) {
      brand = await adminService.findBrand(brandName);
      if (!brand) {
        return res.error({
          message: `Không tìm thấy brand: ${brandName}`,
        });
      }
    }

    // Nếu có truyền categoryName thì mới tìm
    if (categoryName) {
      category = await adminService.findCategory(categoryName);
      if (!category) {
        return res.error({
          message: `Không tìm thấy category: ${categoryName}`,
        });
      }
    }

    const product = await adminService.updateProduct(id, {
      name,
      description,
      production,
      brand,
      category,
      productImages,
      productVariants
    });

    return res.success(product);
  } catch (error) {
    return res.error({
      message: error.message || "Lỗi cập nhật sản phẩm",
    });
  }
};

const deleteProductController = async (req, res) => {
  try {
    const { id } = req.body;

    const result = await adminService.deleteProduct(id);

    return res.success(result);
  } catch (error) {
    return res.error({
      message: error.message || "Lỗi xóa sản phẩm",
    });
  }
};

// Manager
const getAllProducts = async (req, res) => {
  try {
    const products = await adminService.findAllProducts();
    res.success(products);
  } catch (error) {
    return res.error({
      message: error.message || "Không lấy được sản phẩm",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await adminService.findAllUsers();
    res.success(users);
  } catch (error) {
    return res.error({
      message: error.message || "Không lấy được người dùng",
    });
  }
};

const getAllQuantity = async (req, res) => {
  try {
    const quantity = await adminService.findAllQuantity();
    res.success(quantity);
  } catch (error) {
    return res.error({
      message: error.message || "Không lấy được số lượng",
    });
  }
};

// User
const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const updatedUser = await adminService.updateUser(id, payload);

    return res.success({
      message: "Cập nhật user thành công",
      data: updatedUser,
    });
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res.error(
        {
          message: "Không tìm thấy user",
        },
        404,
      );
    }

    if (error.message === "EMAIL_ALREADY_EXISTS") {
      return res.error(
        {
          message: "Email đã tồn tại",
        },
        400,
      );
    }

    if (error.message === "USERNAME_ALREADY_EXISTS") {
      return res.error(
        {
          message: "Username đã tồn tại",
        },
        400,
      );
    }

    console.error("Update user error:", error);

    return res.error(
      {
        message: "Lỗi server",
      },
      500,
    );
  }
};

const deleteUserController = async (req, res, next) => {
  try {
    const { id } = req.body;

    const result = await adminService.deleteUser(id);

    return res.success(result);
  } catch (error) {
    next(error);
  }
};

const getOrdersController = async (req, res) => {
  try {
    const { status, page, limit, search } = req.query;
    const data = await adminService.getOrders({
      status,
      page,
      limit,
      search,
    });
    return res.success({
      message: "Lấy danh sách đơn hàng thành công",
      data,
    });
  } catch (error) {
    return res.error(
      { message: error.message || "Không lấy được danh sách đơn hàng" },
      httpCodes.internalServerError,
    );
  }
};

const getOrderDetailController = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await adminService.getOrderDetail(id);
    return res.success({
      message: "Lấy chi tiết đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    if (error.code === "ORDER_NOT_FOUND" || error.code === "INVALID_ORDER_ID") {
      return res.error(
        { message: error.code === "ORDER_NOT_FOUND" ? "Không tìm thấy đơn hàng" : "Mã đơn hàng không hợp lệ" },
        httpCodes.notFound,
      );
    }
    return res.error(
      { message: error.message || "Không lấy được chi tiết đơn hàng" },
      httpCodes.internalServerError,
    );
  }
};

const updateOrderStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await adminService.updateOrderStatus(id, status);
    return res.success({
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    if (error.code === "ORDER_NOT_FOUND" || error.code === "INVALID_ORDER_ID") {
      return res.error(
        { message: error.code === "ORDER_NOT_FOUND" ? "Không tìm thấy đơn hàng" : "Mã đơn hàng không hợp lệ" },
        httpCodes.notFound,
      );
    }
    if (error.code === "INVALID_STATUS" || error.code === "INVALID_TRANSITION") {
      return res.error({ message: error.message }, httpCodes.badRequest);
    }
    return res.error(
      { message: error.message || "Không cập nhật được trạng thái đơn hàng" },
      httpCodes.internalServerError,
    );
  }
};

module.exports = {
  createProductController,
  updateProductController,
  deleteProductController,
  getAllProducts,
  getAllUsers,
  getAllQuantity,
  updateUserController,
  deleteUserController,
  getOrdersController,
  getOrderDetailController,
  updateOrderStatusController,
};
