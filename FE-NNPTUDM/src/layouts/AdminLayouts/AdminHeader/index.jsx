import React from "react";
import { Menu, Bell, Search, Moon, Sun } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import SmartNavLink from "@/components/SmartNavLink";
import { toast } from "sonner";
import { logout as logoutApi } from "@/services/Auth/AuthService";
import { logout } from "@/features/Auth/AuthSlice";
import { useNavigate } from "react-router";

export default function AdminHeader({ setSidebarOpen, darkMode, setDarkMode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      const res = await logoutApi();
      console.log("logout response:", res);
    } catch (error) {
      throw new Error(error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      toast.success("Đăng xuất thành công");
      dispatch(logout());

      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-xl font-bold sm:text-2xl">Admin Home</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tổng quan quản lý users, products, vouchers và kho hàng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-xl border border-gray-200 p-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button className="relative rounded-xl border border-gray-200 p-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
              <Bell size={18} />
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
            </button>

            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="header-avatar-button hidden items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-700 sm:flex">
                  <img
                    src={user.avatar || "/default-avatar.png"}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <div className="text-left">
                    <p className="text-sm font-semibold">Admin</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </button>
              </HoverCardTrigger>

              <HoverCardContent className="header-dropdown w-[220px] p-3">
                <div className="flex flex-col gap-2">
                  <p className="font-medium">{user.name}</p>

                  <SmartNavLink
                    to="/profile"
                    className="header-dropdown-link cursor-pointer"
                  >
                    Trang cá nhân
                  </SmartNavLink>

                  <SmartNavLink
                    to="/orders"
                    className="header-dropdown-link cursor-pointer"
                  >
                    Đơn hàng
                  </SmartNavLink>

                  <button
                    className="header-dropdown-link cursor-pointer text-red-500 text-left"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>

        {/* <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm user, product, voucher..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-800 dark:focus:ring-indigo-900"
          />
        </div> */}
      </div>
    </header>
  );
}
