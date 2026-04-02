import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, Loader2, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAdminOrderDetail,
  getAdminOrders,
  patchAdminOrderStatus,
} from "@/services/Admin/AdminService";

const STATUS_TABS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã giao" },
  { value: "CANCELLED", label: "Đã huỷ" },
];

const PAYMENT_LABELS = {
  cod: "COD",
  bank_transfer: "Chuyển khoản",
  momo: "MoMo",
  vnpay: "VNPay",
};

function statusBadgeClass(status) {
  const map = {
    PENDING: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
    CONFIRMED: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200",
    SHIPPING: "bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-200",
    DELIVERED: "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200",
    CANCELLED: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200",
  };
  return map[status] || "bg-gray-100 text-gray-800";
}

function getNextAllowedStatuses(current) {
  switch (current) {
    case "PENDING":
      return ["CONFIRMED", "CANCELLED"];
    case "CONFIRMED":
      return ["SHIPPING", "CANCELLED"];
    case "SHIPPING":
      return ["DELIVERED"];
    default:
      return [];
  }
}

function formatMoney(v) {
  const n = Number(v ?? 0);
  return n.toLocaleString("vi-VN") + "₫";
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return String(iso);
  }
}

function getErrorMessage(err) {
  const e = err?.response?.data?.error;
  if (typeof e === "string") return e;
  return e?.message || err?.message || "Có lỗi xảy ra";
}

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [listLoading, setListLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [nextStatus, setNextStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchDebounced]);

  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await getAdminOrders({
        page,
        limit,
        status: statusFilter || undefined,
        search: searchDebounced || undefined,
      });
      const payload = res?.data ?? res;
      setOrders(payload?.orders ?? []);
      setTotalPages(payload?.totalPages ?? 1);
      setTotalItems(payload?.totalItems ?? 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setOrders([]);
    } finally {
      setListLoading(false);
    }
  }, [page, limit, statusFilter, searchDebounced]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openDetail = async (orderId) => {
    setModalOpen(true);
    setDetail(null);
    setNextStatus("");
    setDetailLoading(true);
    try {
      const res = await getAdminOrderDetail(orderId);
      const order = res?.data ?? res;
      setDetail(order);
      const allowed = getNextAllowedStatuses(order?.status);
      setNextStatus(allowed[0] ?? "");
    } catch (err) {
      toast.error(getErrorMessage(err));
      setModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!detail?.id || !nextStatus) return;
    setUpdating(true);
    try {
      await patchAdminOrderStatus(detail.id, nextStatus);
      toast.success("Cập nhật trạng thái thành công");
      setModalOpen(false);
      setDetail(null);
      await fetchList();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const allowedNext = useMemo(
    () => (detail ? getNextAllowedStatuses(detail.status) : []),
    [detail],
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
            <ShoppingBag size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Quản lý đơn hàng
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tổng {totalItems} đơn
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="search"
            placeholder="Tìm theo mã đơn hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value || "all"}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                statusFilter === tab.value
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Mã đơn</th>
                <th className="px-4 py-3 font-semibold">Khách hàng</th>
                <th className="px-4 py-3 font-semibold">Tổng tiền</th>
                <th className="px-4 py-3 font-semibold">Thanh toán</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Ngày đặt</th>
                <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Không có đơn hàng nào.
                  </td>
                </tr>
              ) : (
                orders.map((row) => (
                  <tr
                    key={String(row.id)}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {row.orderCode}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {row.user?.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-indigo-600 dark:text-indigo-400">
                      {formatMoney(row.grandTotal)}
                    </td>
                    <td className="px-4 py-3">
                      {PAYMENT_LABELS[row.paymentMethod] ?? row.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => openDetail(row.id)}
                      >
                        <Eye size={16} className="mr-1" />
                        Xem chi tiết
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
            <p className="text-sm text-gray-500">
              Trang {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || listLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="cursor-pointer"
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || listLoading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="cursor-pointer"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="isolate max-h-[90vh] max-w-2xl overflow-y-auto border-gray-200 bg-white text-gray-900 shadow-2xl sm:max-w-2xl dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>

          {detailLoading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          )}

          {!detailLoading && detail && (
            <div className="space-y-6 text-sm">
              <div className="grid gap-2 rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
                <p>
                  <span className="text-gray-500">Mã đơn:</span>{" "}
                  <strong>{detail.orderCode}</strong>
                </p>
                <p>
                  <span className="text-gray-500">Ngày đặt:</span>{" "}
                  {formatDate(detail.createdAt)}
                </p>
                <p>
                  <span className="text-gray-500">Địa chỉ:</span>{" "}
                  {detail.addressLine}, {detail.ward}, {detail.city}
                </p>
                <p>
                  <span className="text-gray-500">Thanh toán:</span>{" "}
                  {PAYMENT_LABELS[detail.paymentMethod] ?? detail.paymentMethod}
                </p>
                <p>
                  <span className="text-gray-500">Khách:</span>{" "}
                  {detail.user?.email}
                  {detail.user?.firstName || detail.user?.lastName
                    ? ` (${[detail.user?.firstName, detail.user?.lastName].filter(Boolean).join(" ")})`
                    : ""}
                </p>
                <p>
                  <span className="text-gray-500">Trạng thái:</span>{" "}
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(detail.status)}`}
                  >
                    {detail.status}
                  </span>
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold">Sản phẩm</h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-950">
                  <table className="w-full min-w-[500px] text-left text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-900">
                      <tr>
                        <th className="px-3 py-2">Tên</th>
                        <th className="px-3 py-2">Variant</th>
                        <th className="px-3 py-2">SL</th>
                        <th className="px-3 py-2">Đơn giá</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-950">
                      {(detail.orderItems ?? []).map((item) => (
                        <tr
                          key={String(item.id)}
                          className="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950"
                        >
                          <td className="px-3 py-2">{item.productName}</td>
                          <td className="px-3 py-2 text-gray-600">
                            {item.variantName ?? "—"}
                          </td>
                          <td className="px-3 py-2">{item.quantity}</td>
                          <td className="px-3 py-2">{formatMoney(item.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-1 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tiền hàng</span>
                  <span>{formatMoney(detail.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí ship</span>
                  <span>{formatMoney(detail.shippingFee)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold dark:border-gray-700">
                  <span>Tổng thanh toán</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {formatMoney(detail.grandTotal)}
                  </span>
                </div>
              </div>

              {allowedNext.length > 0 ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      Chuyển trạng thái
                    </label>
                    <select
                      value={nextStatus}
                      onChange={(e) => setNextStatus(e.target.value)}
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    >
                      {allowedNext.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={updating || !nextStatus}
                    className="cursor-pointer bg-indigo-600 hover:bg-indigo-700"
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Cập nhật trạng thái"
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  Không thể thay đổi trạng thái đơn này.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
