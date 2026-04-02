import React from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  TicketPercent,
  Image as ImageIcon,
  Boxes,
  Settings,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "home" },
    { name: "Orders", icon: <ShoppingBag size={20} />, path: "orders" },
    { name: "Users", icon: <Users size={20} />, path: "users" },
    { name: "Products", icon: <Package size={20} />, path: "products" },
    { name: "Vouchers", icon: <TicketPercent size={20} />, path: "vouchers" },
    {
      name: "Product Images",
      icon: <ImageIcon size={20} />,
      path: "product-images",
    },
    { name: "Inventory", icon: <Boxes size={20} />, path: "inventory" },
    { name: "Settings", icon: <Settings size={20} />, path: "settings" },
  ];

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 dark:border-gray-800 dark:bg-gray-900 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-5">
            <h1 className="text-2xl font-bold text-indigo-600">Admin Panel</h1>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Menu */}
          <div className="flex-1 overflow-y-auto p-5">
            <nav className="space-y-2">
              {menuItems.map((item, index) => {
                const fullPath = `/admin/${item.path}`;

                // 🔥 logic active
                const isActive =
                  location.pathname === fullPath ||
                  location.pathname.startsWith(fullPath + "/");

                return (
                  <button
                    key={index}
                    onClick={() => navigate(fullPath)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="border-t p-5">
            <button className="flex w-full items-center gap-3 text-red-500">
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
