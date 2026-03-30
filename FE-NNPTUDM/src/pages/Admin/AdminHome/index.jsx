
import Count from "@/utils/count";
import Total from "@/utils/total";
import {
  Users,
  Package,
  TicketPercent,
  Image as ImageIcon,
  Boxes,
} from "lucide-react";
import { useSelector } from "react-redux";

export default function Home() {
  const products = useSelector(state => state.product.products);
  const users = useSelector(state => state.admin.users);
  
  const totalQuantity = useSelector(state => state.admin.totalQuantity);

  const stats = [
    {
      title: "Tổng Users",
      value: Count(users),
      change: "+12.5%",
      icon: <Users size={22} />,
    },
    {
      title: "Tổng Products",
      value: Count(products.data),
      change: "+8.2%",
      icon: <Package size={22} />,
    },
    {
      title: "Voucher đang hoạt động",
      value: "42",
      change: "+3.1%",
      icon: <TicketPercent size={22} />,
    },
    {
      title: "Tổng tồn kho",
      value: Total(totalQuantity),
      change: "-2.4%",
      icon: <Boxes size={22} />,
    },
  ];

  const quickActions = [
    {
      title: "Quản lý Users",
      desc: "Xem danh sách, khóa/mở tài khoản, phân quyền",
      icon: <Users size={20} />,
    },
    {
      title: "Quản lý Products",
      desc: "Thêm, sửa, xóa sản phẩm và danh mục",
      icon: <Package size={20} />,
    },
    {
      title: "Quản lý Voucher",
      desc: "Tạo mã giảm giá, giới hạn số lượng, ngày hết hạn",
      icon: <TicketPercent size={20} />,
    },
    {
      title: "Quản lý Ảnh sản phẩm",
      desc: "Upload, xem trước, cập nhật ảnh theo sản phẩm",
      icon: <ImageIcon size={20} />,
    },
    {
      title: "Quản lý Số lượng",
      desc: "Theo dõi tồn kho, nhập/xuất, cảnh báo sắp hết",
      icon: <Boxes size={20} />,
    },
  ];

  const recentActivities = [
    "Nguyễn Văn A vừa tạo sản phẩm mới",
    "Voucher SUMMER20 đã được cập nhật",
    "Sản phẩm Áo Thun Basic còn dưới 10 sản phẩm",
    "Admin vừa thêm 3 ảnh mới cho sản phẩm Sneaker X",
    "User Trần Minh đã bị khóa tài khoản",
  ];

  const lowStockProducts = [
    { name: "Áo Hoodie Local Brand", stock: 6 },
    { name: "Sneaker X Gen 2", stock: 4 },
    { name: "Balo Canvas", stock: 9 },
    { name: "Nón Bucket Basic", stock: 7 },
  ];
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.title}
                </p>
                <h3 className="mt-2 text-3xl font-bold">{item.value}</h3>
                <p
                  className={`mt-2 text-sm font-medium ${
                    item.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {item.change} so với tháng trước
                </p>
              </div>
              <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Truy cập nhanh</h3>
            <button className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Xem tất cả
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {quickActions.map((item, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-gray-200 p-4 transition hover:border-indigo-500 hover:bg-indigo-50 dark:border-gray-800 dark:hover:border-indigo-500 dark:hover:bg-gray-800"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                  {item.icon}
                </div>
                <h4 className="text-base font-semibold">{item.title}</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {item.desc}
                </p>
                <button className="mt-4 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  Đi tới trang
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Hoạt động gần đây</h3>
            <button className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Xem thêm
            </button>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800"
              >
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {activity}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sản phẩm sắp hết hàng</h3>
            <button className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Quản lý kho
            </button>
          </div>

          <div className="space-y-4">
            {lowStockProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4 dark:border-gray-800"
              >
                <div>
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Cần nhập thêm hàng
                  </p>
                </div>
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  {product.stock} sp
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-5 text-lg font-semibold">Tóm tắt hệ thống</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                User mới hôm nay
              </p>
              <h4 className="mt-2 text-2xl font-bold">+24</h4>
            </div>

            <div className="rounded-2xl bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Product mới
              </p>
              <h4 className="mt-2 text-2xl font-bold">+8</h4>
            </div>

            <div className="rounded-2xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Voucher hết hạn sớm
              </p>
              <h4 className="mt-2 text-2xl font-bold">5</h4>
            </div>

            <div className="rounded-2xl bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sản phẩm sắp hết
              </p>
              <h4 className="mt-2 text-2xl font-bold">14</h4>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-indigo-300 p-4 dark:border-indigo-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Bạn có thể gắn các nút chuyển trang bằng react-router-dom vào
              sidebar và các ô "Đi tới trang".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
