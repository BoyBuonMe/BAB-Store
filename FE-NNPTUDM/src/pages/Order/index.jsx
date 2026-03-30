import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyOrder } from "@/services/Order/OrderService";
import { Navigate } from "react-router";

export default function Order() {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const { currentOrder, isLoading, isError, message } = useSelector(
    (state) => state.order,
  );

  useEffect(() => {
    dispatch(getMyOrder());
  }, [dispatch]);

  const orders = useMemo(() => {
    if (Array.isArray(currentOrder)) {
      return [...currentOrder].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    }
    return [];
  }, [currentOrder]);

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString("vi-VN") + "đ";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
      case "SHIPPING":
        return "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300";
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300";
    }
  };

  if (!user || Object.keys(user).length === 0) {
    sessionStorage.setItem(
      "redirect_toast",
      JSON.stringify({
        type: "warning",
        message: "Bạn cần đăng nhập để truy cập trang này!",
      }),
    );

    return <Navigate to="/" replace />;
  }

  return (
    <section className="min-h-screen transition-colors duration-300 max-w-6xl mx-auto px-4 py-10 pt-28">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">Đơn hàng của tôi</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)] sm:text-base">
            Theo dõi danh sách đơn hàng, trạng thái, sản phẩm và tổng tiền.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <p className="text-sm text-[var(--muted-foreground)]">
              Đang tải danh sách đơn hàng...
            </p>
          </div>
        )}

        {!isLoading && isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {message || "Có lỗi xảy ra khi tải đơn hàng."}
          </div>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold">Chưa có đơn hàng nào</h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Hiện tại bạn chưa có đơn hàng nào trong hệ thống.
            </p>
          </div>
        )}

        {!isLoading && !isError && orders.length > 0 && (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-[var(--border)] p-4 sm:p-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold sm:text-lg">
                        Mã đơn: {order.orderCode}
                      </h2>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm text-[var(--muted-foreground)] sm:grid-cols-2 lg:grid-cols-4">
                      <p>
                        <span className="font-medium text-[var(--foreground)]">
                          Ngày đặt:
                        </span>{" "}
                        {formatDate(order.createdAt)}
                      </p>
                      <p>
                        <span className="font-medium text-[var(--foreground)]">
                          Thanh toán:
                        </span>{" "}
                        {order.paymentMethod?.toUpperCase()}
                      </p>
                      <p>
                        <span className="font-medium text-[var(--foreground)]">
                          Tổng SL:
                        </span>{" "}
                        {order.totalQuantity}
                      </p>
                      <p>
                        <span className="font-medium text-[var(--foreground)]">
                          Thành tiền:
                        </span>{" "}
                        {formatCurrency(order.grandTotal)}
                      </p>
                    </div>

                    <p className="text-sm text-[var(--muted-foreground)]">
                      <span className="font-medium text-[var(--foreground)]">
                        Địa chỉ:
                      </span>{" "}
                      {order.addressLine}, {order.ward}, {order.city}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  {Array.isArray(order.orderItems) &&
                  order.orderItems.length > 0 ? (
                    <div className="space-y-4">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-1 gap-4 rounded-xl border border-[var(--border)] p-4 sm:grid-cols-[90px_1fr] lg:grid-cols-[90px_1fr_160px]"
                        >
                          <div className="h-[90px] w-full overflow-hidden rounded-xl bg-[var(--muted)] sm:w-[90px]">
                            {item.imageUrl ? (
                              <img
                                src={`http://127.0.0.1:3001${item.imageUrl}`}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted-foreground)]">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-base font-semibold sm:text-lg">
                              {item.productName}
                            </h3>

                            <p className="text-sm text-[var(--muted-foreground)]">
                              Mã sản phẩm: {item.productId}
                            </p>

                            <p className="text-sm text-[var(--muted-foreground)]">
                              Biến thể: {item.variantName || "Mặc định"}
                            </p>

                            <p className="text-sm text-[var(--muted-foreground)]">
                              Số lượng: {item.quantity}
                            </p>

                            <p className="text-sm text-[var(--muted-foreground)]">
                              Đơn giá: {formatCurrency(item.price)}
                            </p>
                          </div>

                          <div className="flex flex-col justify-between lg:items-end">
                            <p className="text-sm text-[var(--muted-foreground)]">
                              Tạm tính
                            </p>
                            <p className="text-lg font-bold text-[var(--foreground)]">
                              {formatCurrency(
                                Number(item.price || 0) *
                                  Number(item.quantity || 0),
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted-foreground)]">
                      Đơn hàng này hiện chưa có sản phẩm.
                    </div>
                  )}

                  <div className="mt-5 ml-auto w-full rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 p-4 sm:max-w-md">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">
                          Tổng số lượng
                        </span>
                        <span className="font-medium">
                          {order.totalQuantity}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">
                          Tổng tiền hàng
                        </span>
                        <span className="font-medium">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[var(--muted-foreground)]">
                          Phí vận chuyển
                        </span>
                        <span className="font-medium">
                          {formatCurrency(order.shippingFee)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                        <span className="font-semibold">Thanh toán</span>
                        <span className="text-lg font-bold">
                          {formatCurrency(order.grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
