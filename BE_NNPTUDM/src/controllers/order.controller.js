const orderService = require("@/services/order.service");

async function createOrderController(req, res) {
  try {
    const userId = req.auth.user.id;
    console.log(typeof userId);
    
    const payload = req.body;

    const order = await orderService.createOrderService(userId, payload);

    return res.success({
      message: "Tạo đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("createOrderController error:", error);

    return res.error({
      message: error.message || "Tạo đơn hàng thất bại",
    });
  }
}

async function getMyOrdersController(req, res) {
  try {
    const userId = req.auth.user.id;

    const orders = await orderService.getMyOrdersService(userId);

    return res.success({
      message: "Lấy danh sách đơn hàng thành công",
      data: orders,
    });
  } catch (error) {
    console.error("getMyOrdersController error:", error);

    return res.error({
      message: "Lấy danh sách đơn hàng thất bại",
    });
  }
}

async function getMyOrderDetailController(req, res) {
  try {
    const userId = req.auth.user.id;
    const { id } = req.params;

    const order = await orderService.getMyOrderDetailService(userId, id);

    if (!order) {
      return res.error({
        message: "Không tìm thấy đơn hàng",
      });
    }

    return res.success({
      message: "Lấy chi tiết đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("getMyOrderDetailController error:", error);

    return res.error({
      message: "Lấy chi tiết đơn hàng thất bại",
    });
  }
}

module.exports = {createOrderController, getMyOrdersController, getMyOrderDetailController}